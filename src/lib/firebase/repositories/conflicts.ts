import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config';
import { inMemoryStore } from '../in-memory-store';
import { ClinicalConflict } from '@/types';
import { clinicalConflictSchema, createClinicalConflictSchema } from '@/lib/validations';
import { z } from 'zod';

export type CreateConflictData = z.input<typeof createClinicalConflictSchema>;

export async function getConflicts(patientId: string): Promise<ClinicalConflict[]> {
  if (!patientId) throw new Error('patientId is required');

  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.getConflicts(patientId);
  }

  try {
    const q = query(
      collection(db, 'patients', patientId, 'conflicts'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const conflicts: ClinicalConflict[] = [];
    snap.forEach((d) => {
      const parsed = clinicalConflictSchema.safeParse({ id: d.id, ...d.data() });
      if (parsed.success) {
        conflicts.push(parsed.data);
      }
    });
    return conflicts;
  } catch (error) {
    console.error(`Firestore error in getConflicts(${patientId}):`, error);
    return inMemoryStore.getConflicts(patientId);
  }
}

export async function getConflict(
  patientId: string,
  conflictId: string
): Promise<ClinicalConflict | null> {
  if (!patientId || !conflictId) throw new Error('patientId and conflictId are required');

  if (!isFirebaseConfigured || !db) {
    const found = inMemoryStore.getConflicts(patientId).find((c) => c.id === conflictId);
    return found ?? null;
  }

  try {
    const ref = doc(db, 'patients', patientId, 'conflicts', conflictId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const parsed = clinicalConflictSchema.safeParse({ id: snap.id, ...snap.data() });
    return parsed.success ? parsed.data : null;
  } catch (error) {
    console.error(`Firestore error in getConflict(${patientId}, ${conflictId}):`, error);
    const found = inMemoryStore.getConflicts(patientId).find((c) => c.id === conflictId);
    return found ?? null;
  }
}

export async function addConflict(
  patientId: string,
  data: CreateConflictData
): Promise<ClinicalConflict> {
  if (!patientId) throw new Error('patientId is required');

  const validated = createClinicalConflictSchema.parse(data);
  const id = validated.id || `conflict_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = validated.createdAt || new Date().toISOString();

  const conflict: ClinicalConflict = {
    ...validated,
    id,
    patientId,
    requiresHumanReview: true,
    createdAt,
  };

  const parsed = clinicalConflictSchema.parse(conflict);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'patients', patientId, 'conflicts', id);
      await setDoc(ref, parsed);
    } catch (error) {
      console.error(`Firestore error adding conflict for patient ${patientId}:`, error);
    }
  }

  inMemoryStore.setConflict(parsed);
  return parsed;
}

export async function updateConflict(
  patientId: string,
  conflictId: string,
  updates: Partial<Omit<ClinicalConflict, 'id' | 'patientId' | 'createdAt'>>
): Promise<ClinicalConflict> {
  if (!patientId || !conflictId) throw new Error('patientId and conflictId are required');

  const existing = await getConflict(patientId, conflictId);
  if (!existing) {
    throw new Error(`ClinicalConflict not found: ${conflictId} for patient ${patientId}`);
  }

  const updated: ClinicalConflict = {
    ...existing,
    ...updates,
    id: conflictId,
    patientId,
    requiresHumanReview: true, // Invariant: always requires human review
  };

  const parsed = clinicalConflictSchema.parse(updated);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'patients', patientId, 'conflicts', conflictId);
      await updateDoc(ref, parsed as Record<string, unknown>);
    } catch (error) {
      console.error(`Firestore error updating conflict ${conflictId}:`, error);
    }
  }

  inMemoryStore.setConflict(parsed);
  return parsed;
}

export function subscribeConflicts(
  patientId: string,
  callback: (conflicts: ClinicalConflict[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!patientId) {
    callback([]);
    return () => {};
  }

  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.subscribeConflicts(patientId, callback);
  }

  try {
    const q = query(
      collection(db, 'patients', patientId, 'conflicts'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(
      q,
      (snap) => {
        const conflicts: ClinicalConflict[] = [];
        snap.forEach((d) => {
          const parsed = clinicalConflictSchema.safeParse({ id: d.id, ...d.data() });
          if (parsed.success) {
            conflicts.push(parsed.data);
          }
        });
        callback(conflicts);
      },
      (error) => {
        console.error(`Firestore error in subscribeConflicts(${patientId}):`, error);
        if (onError) onError(error);
        inMemoryStore.subscribeConflicts(patientId, callback);
      }
    );
  } catch (error) {
    console.error('Exception setting up subscribeConflicts, falling back to memory:', error);
    return inMemoryStore.subscribeConflicts(patientId, callback);
  }
}
