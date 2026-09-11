import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config';
import { inMemoryStore } from '../in-memory-store';
import { RecommendedAction } from '@/types';
import {
  recommendedActionSchema,
  createRecommendedActionSchema,
  approveActionSchema,
  rejectActionSchema,
} from '@/lib/validations';
import { z } from 'zod';
import { addAuditEvent } from './audit';

export type CreateRecommendedActionData = z.input<typeof createRecommendedActionSchema>;

export async function getRecommendedActions(patientId: string): Promise<RecommendedAction[]> {
  if (!patientId) throw new Error('patientId is required');

  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.getActions(patientId);
  }

  try {
    const q = query(collection(db, 'patients', patientId, 'actions'));
    const snap = await getDocs(q);
    const actions: RecommendedAction[] = [];
    snap.forEach((d) => {
      const parsed = recommendedActionSchema.safeParse({ id: d.id, ...d.data() });
      if (parsed.success) {
        actions.push(parsed.data);
      }
    });

    const pOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return actions.sort((a, b) => {
      const pA = typeof a.priority === 'number' ? a.priority : (pOrder[a.priority] ?? 0);
      const pB = typeof b.priority === 'number' ? b.priority : (pOrder[b.priority] ?? 0);
      return pB - pA;
    });
  } catch (error) {
    console.error(`Firestore error in getRecommendedActions(${patientId}):`, error);
    return inMemoryStore.getActions(patientId);
  }
}

export async function getRecommendedAction(
  patientId: string,
  actionId: string
): Promise<RecommendedAction | null> {
  if (!patientId || !actionId) throw new Error('patientId and actionId are required');

  if (!isFirebaseConfigured || !db) {
    const found = inMemoryStore.getActions(patientId).find((a) => a.id === actionId);
    return found ?? null;
  }

  try {
    const ref = doc(db, 'patients', patientId, 'actions', actionId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const parsed = recommendedActionSchema.safeParse({ id: snap.id, ...snap.data() });
    return parsed.success ? parsed.data : null;
  } catch (error) {
    console.error(`Firestore error in getRecommendedAction(${patientId}, ${actionId}):`, error);
    const found = inMemoryStore.getActions(patientId).find((a) => a.id === actionId);
    return found ?? null;
  }
}

export async function addRecommendedAction(
  patientId: string,
  data: CreateRecommendedActionData
): Promise<RecommendedAction> {
  if (!patientId) throw new Error('patientId is required');

  const validated = createRecommendedActionSchema.parse(data);
  const id = validated.id || `action_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const action: RecommendedAction = {
    ...validated,
    id,
    patientId,
    requiresHumanApproval: true,
    status: 'pending',
  };

  const parsed = recommendedActionSchema.parse(action);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'patients', patientId, 'actions', id);
      await setDoc(ref, parsed);
    } catch (error) {
      console.error(`Firestore error adding action for patient ${patientId}:`, error);
    }
  }

  inMemoryStore.setAction(parsed);

  // Automatically record audit event for action recommendation
  await addAuditEvent(patientId, {
    type: 'action_recommended',
    actor: 'ai',
    description: `Recommendation generated: ${parsed.action} (${parsed.rationale})`,
  });

  return parsed;
}

export async function approveAction(
  patientId: string,
  actionId: string,
  approvedBy: string
): Promise<RecommendedAction> {
  const { approvedBy: validApprovedBy } = approveActionSchema.parse({ approvedBy });

  const existing = await getRecommendedAction(patientId, actionId);
  if (!existing) {
    throw new Error(`RecommendedAction not found: ${actionId} for patient ${patientId}`);
  }

  if (existing.status !== 'pending') {
    throw new Error(`Cannot approve action ${actionId}: current status is '${existing.status}'`);
  }

  const now = new Date().toISOString();
  const updated: RecommendedAction = {
    ...existing,
    status: 'approved',
    approvedBy: validApprovedBy,
    approvedAt: now,
    requiresHumanApproval: true,
  };

  const parsed = recommendedActionSchema.parse(updated);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'patients', patientId, 'actions', actionId);
      await updateDoc(ref, parsed as Record<string, unknown>);
    } catch (error) {
      console.error(`Firestore error approving action ${actionId}:`, error);
    }
  }

  inMemoryStore.setAction(parsed);

  // Record audit trail
  await addAuditEvent(patientId, {
    type: 'action_approved',
    actor: 'clinician',
    description: `Clinician ${validApprovedBy} approved action: "${parsed.action}"`,
  });

  return parsed;
}

export async function rejectAction(
  patientId: string,
  actionId: string,
  rejectedBy: string,
  reason?: string
): Promise<RecommendedAction> {
  const { rejectedBy: validRejectedBy, reason: validReason } = rejectActionSchema.parse({
    rejectedBy,
    reason,
  });

  const existing = await getRecommendedAction(patientId, actionId);
  if (!existing) {
    throw new Error(`RecommendedAction not found: ${actionId} for patient ${patientId}`);
  }

  if (existing.status !== 'pending') {
    throw new Error(`Cannot reject action ${actionId}: current status is '${existing.status}'`);
  }

  const now = new Date().toISOString();
  const updated: RecommendedAction = {
    ...existing,
    status: 'rejected',
    rejectedBy: validRejectedBy,
    rejectedAt: now,
    rejectionReason: validReason,
    requiresHumanApproval: true,
  };

  const parsed = recommendedActionSchema.parse(updated);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'patients', patientId, 'actions', actionId);
      await updateDoc(ref, parsed as Record<string, unknown>);
    } catch (error) {
      console.error(`Firestore error rejecting action ${actionId}:`, error);
    }
  }

  inMemoryStore.setAction(parsed);

  // Record audit trail
  await addAuditEvent(patientId, {
    type: 'action_rejected',
    actor: 'clinician',
    description: `Clinician ${validRejectedBy} rejected action: "${parsed.action}". Reason: ${validReason || 'None provided'}`,
  });

  return parsed;
}

export function subscribeRecommendedActions(
  patientId: string,
  callback: (actions: RecommendedAction[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!patientId) {
    callback([]);
    return () => {};
  }

  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.subscribeActions(patientId, callback);
  }

  try {
    const q = query(collection(db, 'patients', patientId, 'actions'));
    return onSnapshot(
      q,
      (snap) => {
        const actions: RecommendedAction[] = [];
        snap.forEach((d) => {
          const parsed = recommendedActionSchema.safeParse({ id: d.id, ...d.data() });
          if (parsed.success) {
            actions.push(parsed.data);
          }
        });

        const pOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        actions.sort((a, b) => {
          const pA = typeof a.priority === 'number' ? a.priority : (pOrder[a.priority] ?? 0);
          const pB = typeof b.priority === 'number' ? b.priority : (pOrder[b.priority] ?? 0);
          return pB - pA;
        });

        callback(actions);
      },
      (error) => {
        console.error(`Firestore error in subscribeRecommendedActions(${patientId}):`, error);
        if (onError) onError(error);
        inMemoryStore.subscribeActions(patientId, callback);
      }
    );
  } catch (error) {
    console.error('Exception setting up subscribeRecommendedActions, falling back to memory:', error);
    return inMemoryStore.subscribeActions(patientId, callback);
  }
}
