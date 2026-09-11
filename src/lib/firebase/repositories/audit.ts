import {
  doc,
  getDocs,
  setDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config';
import { inMemoryStore } from '../in-memory-store';
import { AuditEvent } from '@/types';
import { auditEventSchema, createAuditEventSchema } from '@/lib/validations';
import { z } from 'zod';

export type CreateAuditEventData = z.input<typeof createAuditEventSchema>;

export async function getAuditEvents(patientId: string): Promise<AuditEvent[]> {
  if (!patientId) throw new Error('patientId is required');

  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.getAuditEvents(patientId);
  }

  try {
    const q = query(
      collection(db, 'patients', patientId, 'auditEvents'),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    const events: AuditEvent[] = [];
    snap.forEach((d) => {
      const parsed = auditEventSchema.safeParse({ id: d.id, ...d.data() });
      if (parsed.success) {
        events.push(parsed.data);
      }
    });
    return events;
  } catch (error) {
    console.error(`Firestore error in getAuditEvents(${patientId}):`, error);
    return inMemoryStore.getAuditEvents(patientId);
  }
}

export async function addAuditEvent(
  patientId: string,
  data: CreateAuditEventData
): Promise<AuditEvent> {
  if (!patientId) throw new Error('patientId is required');

  const validated = createAuditEventSchema.parse(data);
  const id = validated.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = validated.createdAt || new Date().toISOString();

  const event: AuditEvent = {
    ...validated,
    id,
    patientId,
    createdAt,
  };

  const parsed = auditEventSchema.parse(event);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'patients', patientId, 'auditEvents', id);
      await setDoc(ref, parsed);
    } catch (error) {
      console.error(`Firestore error adding audit event for patient ${patientId}:`, error);
    }
  }

  inMemoryStore.setAuditEvent(parsed);
  return parsed;
}

export function subscribeAuditEvents(
  patientId: string,
  callback: (events: AuditEvent[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!patientId) {
    callback([]);
    return () => {};
  }

  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.subscribeAuditEvents(patientId, callback);
  }

  try {
    const q = query(
      collection(db, 'patients', patientId, 'auditEvents'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(
      q,
      (snap) => {
        const events: AuditEvent[] = [];
        snap.forEach((d) => {
          const parsed = auditEventSchema.safeParse({ id: d.id, ...d.data() });
          if (parsed.success) {
            events.push(parsed.data);
          }
        });
        callback(events);
      },
      (error) => {
        console.error(`Firestore error in subscribeAuditEvents(${patientId}):`, error);
        if (onError) onError(error);
        inMemoryStore.subscribeAuditEvents(patientId, callback);
      }
    );
  } catch (error) {
    console.error('Exception setting up subscribeAuditEvents, falling back to memory:', error);
    return inMemoryStore.subscribeAuditEvents(patientId, callback);
  }
}
