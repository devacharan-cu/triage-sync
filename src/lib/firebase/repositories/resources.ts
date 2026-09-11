import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config';
import { inMemoryStore } from '../in-memory-store';
import { HospitalResource } from '@/types';
import { hospitalResourceSchema, createHospitalResourceSchema } from '@/lib/validations';
import { z } from 'zod';

export type CreateHospitalResourceData = z.input<typeof createHospitalResourceSchema>;

export async function getResources(): Promise<HospitalResource[]> {
  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.getResources();
  }

  try {
    const snap = await getDocs(collection(db, 'resources'));
    const resources: HospitalResource[] = [];
    snap.forEach((d) => {
      const parsed = hospitalResourceSchema.safeParse({ id: d.id, ...d.data() });
      if (parsed.success) {
        resources.push(parsed.data);
      }
    });
    return resources.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Firestore error in getResources:', error);
    return inMemoryStore.getResources();
  }
}

export async function getResource(resourceId: string): Promise<HospitalResource | null> {
  if (!resourceId) throw new Error('resourceId is required');

  if (!isFirebaseConfigured || !db) {
    const found = inMemoryStore.getResources().find((r) => r.id === resourceId);
    return found ?? null;
  }

  try {
    const ref = doc(db, 'resources', resourceId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const parsed = hospitalResourceSchema.safeParse({ id: snap.id, ...snap.data() });
    return parsed.success ? parsed.data : null;
  } catch (error) {
    console.error(`Firestore error in getResource(${resourceId}):`, error);
    const found = inMemoryStore.getResources().find((r) => r.id === resourceId);
    return found ?? null;
  }
}

export async function setResource(resource: HospitalResource): Promise<HospitalResource> {
  const parsed = hospitalResourceSchema.parse(resource);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'resources', parsed.id);
      await setDoc(ref, parsed);
    } catch (error) {
      console.error(`Firestore error setting resource ${parsed.id}:`, error);
    }
  }

  inMemoryStore.setResource(parsed);
  return parsed;
}

export async function updateResource(
  resourceId: string,
  updates: Partial<Omit<HospitalResource, 'id'>>
): Promise<HospitalResource> {
  if (!resourceId) throw new Error('resourceId is required');

  const existing = await getResource(resourceId);
  if (!existing) {
    throw new Error(`HospitalResource not found: ${resourceId}`);
  }

  const updated: HospitalResource = {
    ...existing,
    ...updates,
    id: resourceId,
    updatedAt: new Date().toISOString(),
  };

  const parsed = hospitalResourceSchema.parse(updated);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'resources', resourceId);
      await updateDoc(ref, parsed as Record<string, unknown>);
    } catch (error) {
      console.error(`Firestore error updating resource ${resourceId}:`, error);
    }
  }

  inMemoryStore.setResource(parsed);
  return parsed;
}

export function subscribeResources(
  callback: (resources: HospitalResource[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!isFirebaseConfigured || !db) {
    return inMemoryStore.subscribeResources(callback);
  }

  try {
    const col = collection(db, 'resources');
    return onSnapshot(
      col,
      (snap) => {
        const resources: HospitalResource[] = [];
        snap.forEach((d) => {
          const parsed = hospitalResourceSchema.safeParse({ id: d.id, ...d.data() });
          if (parsed.success) {
            resources.push(parsed.data);
          }
        });
        callback(resources.sort((a, b) => a.name.localeCompare(b.name)));
      },
      (error) => {
        console.error('Firestore error in subscribeResources:', error);
        if (onError) onError(error);
        inMemoryStore.subscribeResources(callback);
      }
    );
  } catch (error) {
    console.error('Exception setting up subscribeResources, falling back to memory:', error);
    return inMemoryStore.subscribeResources(callback);
  }
}
