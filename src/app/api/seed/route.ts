import { SYNTHETIC_PATIENTS, SYNTHETIC_FACTS, SYNTHETIC_CONFLICTS, HOSPITAL_RESOURCES } from '@/lib/data/indian-reference-data';
import { NextResponse } from 'next/server';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { inMemoryStore } from '@/lib/firebase/in-memory-store';
import { Patient, ClinicalFact, ClinicalConflict, HospitalResource, AuditEvent } from '@/types';
import { INDIAN_REFERENCE_DATA } from '@/lib/data/indian-reference-data';









async function clearCollection(path: string) {
  if (!db) return;
  const colRef = collection(db, path);
  const snap = await getDocs(colRef);
  const batch = writeBatch(db);
  snap.docs.forEach(d => {
    batch.delete(d.ref);
  });
  await batch.commit();
}

export async function POST() {
  try {
    if (isFirebaseConfigured && db) {
      // 1. Clear old top-level collections
      await clearCollection('patients');
      await clearCollection('referenceData');
      await clearCollection('hospitalResources');

      // 2. Insert resources & references
      const resBatch = writeBatch(db);
      HOSPITAL_RESOURCES.forEach(r => resBatch.set(doc(db!, 'hospitalResources', r.id), r));
      await resBatch.commit();

      const refBatch = writeBatch(db);
      INDIAN_REFERENCE_DATA.forEach(r => refBatch.set(doc(db!, 'referenceData', r.id), r));
      await refBatch.commit();

      // 3. Insert patients and subcollections
      for (const patient of SYNTHETIC_PATIENTS) {
        const pBatch = writeBatch(db);
        pBatch.set(doc(db!, 'patients', patient.id), patient);
        
        SYNTHETIC_FACTS.filter(f => f.patientId === patient.id).forEach(f => pBatch.set(doc(db!, 'patients', patient.id, 'clinicalFacts', f.id), f));
        SYNTHETIC_CONFLICTS.filter(c => c.patientId === patient.id).forEach(c => pBatch.set(doc(db!, 'patients', patient.id, 'conflicts', c.id), c));

        const auditId = `audit_\${patient.id}_init`;
        const audit: AuditEvent = {
          id: auditId,
          patientId: patient.id,
          type: 'patient_arrived',
          actor: 'system',
          description: 'Synthetic Indian patient record initialized for demonstration.',
          createdAt: patient.createdAt
        };
        pBatch.set(doc(db!, 'patients', patient.id, 'auditEvents', auditId), audit);

        await pBatch.commit();
      }
    } else {
      // Fallback: Clear in-memory store
      inMemoryStore.reset();

      // Insert directly into in-memory maps
      SYNTHETIC_PATIENTS.forEach(p => inMemoryStore.patients.set(p.id, p));
      SYNTHETIC_FACTS.forEach(f => inMemoryStore.facts.set(f.id, f));
      SYNTHETIC_CONFLICTS.forEach(c => inMemoryStore.conflicts.set(c.id, c));
      HOSPITAL_RESOURCES.forEach(r => inMemoryStore.resources.set(r.id, r));
      
      SYNTHETIC_PATIENTS.forEach(p => {
        const auditId = `audit_\${p.id}_init`;
        const audit: AuditEvent = {
          id: auditId,
          patientId: p.id,
          type: 'patient_arrived',
          actor: 'system',
          description: 'Synthetic Indian patient record initialized for demonstration.',
          createdAt: p.createdAt
        };
        inMemoryStore.auditEvents.set(auditId, audit);
      });
      // We don't store referenceData in inMemoryStore currently as it wasn't there before, 
      // but for seeding it's okay.
    }

    return NextResponse.json({ success: true, message: 'Database seeded with Indian Synthetic Data successfully.' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
