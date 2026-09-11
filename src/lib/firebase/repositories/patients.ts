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
import { Patient } from '@/types';
import { patientSchema, createPatientSchema } from '@/lib/validations';
import { z } from 'zod';

export type CreatePatientInput = z.input<typeof createPatientSchema>;

export async function getPatient(patientId: string): Promise<Patient | null> {
  if (!patientId) throw new Error('patientId is required');

  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.getPatient(patientId);
  }

  try {
    const ref = doc(db, 'patients', patientId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const parsed = patientSchema.safeParse({ id: snap.id, ...snap.data() });
    if (!parsed.success) {
      console.warn(`Malformed patient record for ${patientId}:`, parsed.error);
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.error(`Firestore error in getPatient(${patientId}), falling back to memory:`, error);
    return inMemoryStore.getPatient(patientId);
  }
}

export async function listPatients(): Promise<Patient[]> {
  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.listPatients();
  }

  try {
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const patients: Patient[] = [];
    snap.forEach((d) => {
      const parsed = patientSchema.safeParse({ id: d.id, ...d.data() });
      if (parsed.success) {
        patients.push(parsed.data);
      }
    });
    return patients;
  } catch (error) {
    console.error('Firestore error in listPatients, falling back to memory:', error);
    return inMemoryStore.listPatients();
  }
}

export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  const validated = createPatientSchema.parse(input);
  const id = validated.id || `patient_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const patient: Patient = {
    ...validated,
    id,
    createdAt: now,
    updatedAt: now,
  };

  const parsed = patientSchema.parse(patient);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'patients', id);
      await setDoc(ref, parsed);
    } catch (error) {
      console.error(`Firestore error creating patient ${id}:`, error);
    }
  }

  // Always mirror in memory for seamless sync
  inMemoryStore.setPatient(parsed);
  return parsed;
}

export async function updatePatient(
  patientId: string,
  updates: Partial<Omit<Patient, 'id' | 'createdAt'>>
): Promise<Patient> {
  if (!patientId) throw new Error('patientId is required');

  const existing = await getPatient(patientId);
  if (!existing) {
    throw new Error(`Patient not found: ${patientId}`);
  }

  const updated: Patient = {
    ...existing,
    ...updates,
    id: patientId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const parsed = patientSchema.parse(updated);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'patients', patientId);
      await updateDoc(ref, parsed as Record<string, unknown>);
    } catch (error) {
      console.error(`Firestore error updating patient ${patientId}:`, error);
    }
  }

  inMemoryStore.setPatient(parsed);
  return parsed;
}

export function subscribePatient(
  patientId: string,
  callback: (patient: Patient | null) => void,
  onError?: (error: Error) => void
): () => void {
  if (!patientId) {
    callback(null);
    return () => {};
  }

  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.subscribePatient(patientId, callback);
  }

  try {
    const ref = doc(db, 'patients', patientId);
    return onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          callback(null);
          return;
        }
        const parsed = patientSchema.safeParse({ id: snap.id, ...snap.data() });
        if (parsed.success) {
          callback(parsed.data);
        } else {
          console.warn(`Malformed patient snapshot for ${patientId}:`, parsed.error);
          callback(null);
        }
      },
      (error) => {
        console.error(`Firestore error in subscribePatient(${patientId}):`, error);
        if (onError) onError(error);
        // Fallback to memory store
        inMemoryStore.subscribePatient(patientId, callback);
      }
    );
  } catch (error) {
    console.error('Exception setting up subscribePatient, falling back to memory:', error);
    return inMemoryStore.subscribePatient(patientId, callback);
  }
}

export function subscribePatients(
  callback: (patients: Patient[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.subscribeAllPatients(callback);
  }

  try {
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        const patients: Patient[] = [];
        snap.forEach((d) => {
          const parsed = patientSchema.safeParse({ id: d.id, ...d.data() });
          if (parsed.success) {
            patients.push(parsed.data);
          }
        });
        callback(patients);
      },
      (error) => {
        console.error('Firestore error in subscribePatients:', error);
        if (onError) onError(error);
        inMemoryStore.subscribeAllPatients(callback);
      }
    );
  } catch (error) {
    console.error('Exception setting up subscribePatients, falling back to memory:', error);
    return inMemoryStore.subscribeAllPatients(callback);
  }
}
