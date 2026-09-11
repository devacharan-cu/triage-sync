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
import { ClinicalFact } from '@/types';
import { clinicalFactSchema, createClinicalFactSchema } from '@/lib/validations';
import { z } from 'zod';

export type CreateClinicalFactData = z.input<typeof createClinicalFactSchema>;

export async function getClinicalFacts(patientId: string): Promise<ClinicalFact[]> {
  if (!patientId) throw new Error('patientId is required');

  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.getFacts(patientId);
  }

  try {
    const q = query(
      collection(db, 'patients', patientId, 'clinicalFacts'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const facts: ClinicalFact[] = [];
    snap.forEach((d) => {
      const parsed = clinicalFactSchema.safeParse({ id: d.id, ...d.data() });
      if (parsed.success) {
        facts.push(parsed.data);
      }
    });
    return facts;
  } catch (error) {
    console.error(`Firestore error in getClinicalFacts(${patientId}):`, error);
    return inMemoryStore.getFacts(patientId);
  }
}

export async function getClinicalFact(
  patientId: string,
  factId: string
): Promise<ClinicalFact | null> {
  if (!patientId || !factId) throw new Error('patientId and factId are required');

  if (!isFirebaseConfigured || !db) {
    const found = inMemoryStore.getFacts(patientId).find((f) => f.id === factId);
    return found ?? null;
  }

  try {
    const ref = doc(db, 'patients', patientId, 'clinicalFacts', factId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const parsed = clinicalFactSchema.safeParse({ id: snap.id, ...snap.data() });
    return parsed.success ? parsed.data : null;
  } catch (error) {
    console.error(`Firestore error in getClinicalFact(${patientId}, ${factId}):`, error);
    const found = inMemoryStore.getFacts(patientId).find((f) => f.id === factId);
    return found ?? null;
  }
}

export async function addClinicalFact(
  patientId: string,
  data: CreateClinicalFactData
): Promise<ClinicalFact> {
  if (!patientId) throw new Error('patientId is required');

  const validated = createClinicalFactSchema.parse(data);
  const id = validated.id || `fact_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = validated.createdAt || new Date().toISOString();

  const fact: ClinicalFact = {
    ...validated,
    id,
    patientId,
    createdAt,
  };

  const parsed = clinicalFactSchema.parse(fact);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'patients', patientId, 'clinicalFacts', id);
      await setDoc(ref, parsed);
    } catch (error) {
      console.error(`Firestore error adding clinical fact for patient ${patientId}:`, error);
    }
  }

  inMemoryStore.setFact(parsed);
  return parsed;
}

export async function updateClinicalFact(
  patientId: string,
  factId: string,
  updates: Partial<Omit<ClinicalFact, 'id' | 'patientId' | 'createdAt'>>
): Promise<ClinicalFact> {
  if (!patientId || !factId) throw new Error('patientId and factId are required');

  const existing = await getClinicalFact(patientId, factId);
  if (!existing) {
    throw new Error(`ClinicalFact not found: ${factId} for patient ${patientId}`);
  }

  const updated: ClinicalFact = {
    ...existing,
    ...updates,
    id: factId,
    patientId,
  };

  const parsed = clinicalFactSchema.parse(updated);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'patients', patientId, 'clinicalFacts', factId);
      await updateDoc(ref, parsed as Record<string, unknown>);
    } catch (error) {
      console.error(`Firestore error updating fact ${factId}:`, error);
    }
  }

  inMemoryStore.setFact(parsed);
  return parsed;
}

export function subscribeClinicalFacts(
  patientId: string,
  callback: (facts: ClinicalFact[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!patientId) {
    callback([]);
    return () => {};
  }

  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.subscribeFacts(patientId, callback);
  }

  try {
    const q = query(
      collection(db, 'patients', patientId, 'clinicalFacts'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(
      q,
      (snap) => {
        const facts: ClinicalFact[] = [];
        snap.forEach((d) => {
          const parsed = clinicalFactSchema.safeParse({ id: d.id, ...d.data() });
          if (parsed.success) {
            facts.push(parsed.data);
          }
        });
        callback(facts);
      },
      (error) => {
        console.error(`Firestore error in subscribeClinicalFacts(${patientId}):`, error);
        if (onError) onError(error);
        inMemoryStore.subscribeFacts(patientId, callback);
      }
    );
  } catch (error) {
    console.error('Exception setting up subscribeClinicalFacts, falling back to memory:', error);
    return inMemoryStore.subscribeFacts(patientId, callback);
  }
}
