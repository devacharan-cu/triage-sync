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
import { PatientInput } from '@/types';
import { patientInputSchema, createInputSchema } from '@/lib/validations';
import { z } from 'zod';

export type CreateInputData = z.input<typeof createInputSchema>;

export async function getInputs(patientId: string): Promise<PatientInput[]> {
  if (!patientId) throw new Error('patientId is required');

  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.getInputs(patientId);
  }

  try {
    const q = query(
      collection(db, 'patients', patientId, 'inputs'),
      orderBy('uploadedAt', 'asc')
    );
    const snap = await getDocs(q);
    const results: PatientInput[] = [];
    snap.forEach((d) => {
      const parsed = patientInputSchema.safeParse({ id: d.id, ...d.data() });
      if (parsed.success) {
        results.push(parsed.data);
      }
    });
    return results;
  } catch (error) {
    console.error(`Firestore error in getInputs(${patientId}), falling back to memory:`, error);
    return inMemoryStore.getInputs(patientId);
  }
}

export async function getInput(
  patientId: string,
  inputId: string
): Promise<PatientInput | null> {
  if (!patientId || !inputId) throw new Error('patientId and inputId are required');

  if (!isFirebaseConfigured || !db) {
    const found = inMemoryStore.getInputs(patientId).find((i) => i.id === inputId);
    return found ?? null;
  }

  try {
    const ref = doc(db, 'patients', patientId, 'inputs', inputId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const parsed = patientInputSchema.safeParse({ id: snap.id, ...snap.data() });
    return parsed.success ? parsed.data : null;
  } catch (error) {
    console.error(`Firestore error in getInput(${patientId}, ${inputId}):`, error);
    const found = inMemoryStore.getInputs(patientId).find((i) => i.id === inputId);
    return found ?? null;
  }
}

export async function addInput(
  patientId: string,
  data: CreateInputData
): Promise<PatientInput> {
  if (!patientId) throw new Error('patientId is required');

  const validated = createInputSchema.parse(data);
  const id = validated.id || `input_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const uploadedAt = validated.uploadedAt || new Date().toISOString();

  const input: PatientInput = {
    ...validated,
    id,
    patientId,
    uploadedAt,
  };

  const parsed = patientInputSchema.parse(input);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'patients', patientId, 'inputs', id);
      await setDoc(ref, parsed);
    } catch (error) {
      console.error(`Firestore error adding input for patient ${patientId}:`, error);
    }
  }

  inMemoryStore.setInput(parsed);
  return parsed;
}

export async function updateInput(
  patientId: string,
  inputId: string,
  updates: Partial<Omit<PatientInput, 'id' | 'patientId' | 'uploadedAt'>>
): Promise<PatientInput> {
  if (!patientId || !inputId) throw new Error('patientId and inputId are required');

  const existing = await getInput(patientId, inputId);
  if (!existing) {
    throw new Error(`Input not found: ${inputId} for patient ${patientId}`);
  }

  const updated: PatientInput = {
    ...existing,
    ...updates,
    id: inputId,
    patientId,
  };

  const parsed = patientInputSchema.parse(updated);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'patients', patientId, 'inputs', inputId);
      await updateDoc(ref, parsed as Record<string, unknown>);
    } catch (error) {
      console.error(`Firestore error updating input ${inputId}:`, error);
    }
  }

  inMemoryStore.setInput(parsed);
  return parsed;
}

export function subscribeInputs(
  patientId: string,
  callback: (inputs: PatientInput[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!patientId) {
    callback([]);
    return () => {};
  }

  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.subscribeInputs(patientId, callback);
  }

  try {
    const q = query(
      collection(db, 'patients', patientId, 'inputs'),
      orderBy('uploadedAt', 'asc')
    );
    return onSnapshot(
      q,
      (snap) => {
        const results: PatientInput[] = [];
        snap.forEach((d) => {
          const parsed = patientInputSchema.safeParse({ id: d.id, ...d.data() });
          if (parsed.success) {
            results.push(parsed.data);
          }
        });
        callback(results);
      },
      (error) => {
        console.error(`Firestore error in subscribeInputs(${patientId}):`, error);
        if (onError) onError(error);
        inMemoryStore.subscribeInputs(patientId, callback);
      }
    );
  } catch (error) {
    console.error('Exception setting up subscribeInputs, falling back to memory:', error);
    return inMemoryStore.subscribeInputs(patientId, callback);
  }
}
