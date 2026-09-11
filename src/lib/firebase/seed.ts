import {
  DEMO_PATIENT_047,
  DEMO_INPUTS_047,
  DEMO_FACTS_047,
  DEMO_CONFLICTS_047,
  DEMO_ACTIONS_047,
  DEMO_AUDIT_EVENTS_047,
  DEMO_RESOURCES,
  DEMO_OTHER_PATIENTS,
} from './demo-data';
import { inMemoryStore } from './in-memory-store';
import { db, isFirebaseConfigured } from './config';
import { doc, setDoc } from 'firebase/firestore';

export async function seedDemoData(options: { forceInMemoryOnly?: boolean } = {}) {
  const useMemoryOnly = options.forceInMemoryOnly || !isFirebaseConfigured || !db;

  // 1. Seed in-memory store
  inMemoryStore.setPatient(DEMO_PATIENT_047);
  for (const patient of DEMO_OTHER_PATIENTS) {
    inMemoryStore.setPatient(patient);
  }
  for (const input of DEMO_INPUTS_047) {
    inMemoryStore.setInput(input);
  }
  for (const fact of DEMO_FACTS_047) {
    inMemoryStore.setFact(fact);
  }
  for (const conflict of DEMO_CONFLICTS_047) {
    inMemoryStore.setConflict(conflict);
  }
  for (const action of DEMO_ACTIONS_047) {
    inMemoryStore.setAction(action);
  }
  for (const event of DEMO_AUDIT_EVENTS_047) {
    inMemoryStore.setAuditEvent(event);
  }
  for (const resource of DEMO_RESOURCES) {
    inMemoryStore.setResource(resource);
  }

  // 2. If live Firebase is configured and not forced memory-only, seed Firestore
  if (!useMemoryOnly && db) {
    try {
      // Patients
      await setDoc(doc(db, 'patients', DEMO_PATIENT_047.id), DEMO_PATIENT_047);
      for (const p of DEMO_OTHER_PATIENTS) {
        await setDoc(doc(db, 'patients', p.id), p);
      }

      // Patient #047 subcollections
      for (const input of DEMO_INPUTS_047) {
        await setDoc(doc(db, 'patients', DEMO_PATIENT_047.id, 'inputs', input.id), input);
      }
      for (const fact of DEMO_FACTS_047) {
        await setDoc(doc(db, 'patients', DEMO_PATIENT_047.id, 'clinicalFacts', fact.id), fact);
      }
      for (const conflict of DEMO_CONFLICTS_047) {
        await setDoc(doc(db, 'patients', DEMO_PATIENT_047.id, 'conflicts', conflict.id), conflict);
      }
      for (const action of DEMO_ACTIONS_047) {
        await setDoc(doc(db, 'patients', DEMO_PATIENT_047.id, 'actions', action.id), action);
      }
      for (const event of DEMO_AUDIT_EVENTS_047) {
        await setDoc(doc(db, 'patients', DEMO_PATIENT_047.id, 'auditEvents', event.id), event);
      }

      // Resources
      for (const res of DEMO_RESOURCES) {
        await setDoc(doc(db, 'resources', res.id), res);
      }
      console.log('Seeded demo data to Firestore successfully.');
    } catch (error) {
      console.error('Failed to seed demo data to Firestore, kept in memory:', error);
    }
  }

  return {
    patient: DEMO_PATIENT_047,
    inputsCount: DEMO_INPUTS_047.length,
    factsCount: DEMO_FACTS_047.length,
    conflictsCount: DEMO_CONFLICTS_047.length,
    actionsCount: DEMO_ACTIONS_047.length,
    resourcesCount: DEMO_RESOURCES.length,
    auditEventsCount: DEMO_AUDIT_EVENTS_047.length,
  };
}

