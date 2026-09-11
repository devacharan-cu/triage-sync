import { describe, it, expect, beforeEach } from 'vitest';
import { inMemoryStore } from './in-memory-store';
import {
  getPatient,
  createPatient,
  updatePatient,
  listPatients,
  subscribePatient,
  addInput,
  getInputs,
  updateInput,
  addClinicalFact,
  getClinicalFacts,
  updateClinicalFact,
  addConflict,
  getConflicts,
  updateConflict,
  addRecommendedAction,
  getRecommendedActions,
  approveAction,
  rejectAction,
  getResources,
  updateResource,
  setResource,
  getAuditEvents,
  addAuditEvent,
} from './repositories';
import { seedDemoData } from './seed';

describe('Firebase Repositories', () => {
  beforeEach(() => {
    inMemoryStore.reset();
  });

  describe('Patients Repository', () => {
    it('creates and retrieves a patient', async () => {
      const patient = await createPatient({
        name: 'Alex Carter',
        age: 24,
        gender: 'Male',
        state: 'UPLOADED',
        severity: 'CRITICAL',
      });

      expect(patient.id).toBeDefined();
      expect(patient.name).toBe('Alex Carter');

      const retrieved = await getPatient(patient.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(patient.id);
      expect(retrieved?.severity).toBe('CRITICAL');
    });

    it('updates patient state transitions correctly', async () => {
      const patient = await createPatient({
        name: 'Alex Carter',
        state: 'UPLOADED',
      });

      const updated = await updatePatient(patient.id, {
        state: 'CONFLICT_DETECTED',
        statusDescription: 'Elevated risk of cardiac compromise',
      });

      expect(updated.state).toBe('CONFLICT_DETECTED');
      expect(updated.statusDescription).toBe('Elevated risk of cardiac compromise');

      const fetched = await getPatient(patient.id);
      expect(fetched?.state).toBe('CONFLICT_DETECTED');
    });

    it('lists all patients in sorted order', async () => {
      await createPatient({ id: 'p1', name: 'Patient 1' });
      await createPatient({ id: 'p2', name: 'Patient 2' });

      const all = await listPatients();
      expect(all.length).toBe(2);
    });

    it('notifies subscriber on patient updates', async () => {
      const p = await createPatient({ name: 'Alex Carter' });
      let receivedState: string | undefined;

      const unsubscribe = subscribePatient(p.id, (patient) => {
        receivedState = patient?.state;
      });

      expect(receivedState).toBe('UPLOADED');

      await updatePatient(p.id, { state: 'PROCESSING' });
      expect(receivedState).toBe('PROCESSING');

      unsubscribe();
    });
  });

  describe('Inputs Repository', () => {
    it('adds and retrieves inputs for a patient', async () => {
      const p = await createPatient({ name: 'Alex Carter' });

      const input = await addInput(p.id, {
        patientId: p.id,
        type: 'audio',
        storagePath: 'audio/handover_047.wav',
        sourceLabel: 'Paramedic Handover (Audio)',
      });

      expect(input.id).toBeDefined();
      expect(input.processingStatus).toBe('pending');

      const inputs = await getInputs(p.id);
      expect(inputs.length).toBe(1);
      expect(inputs[0].sourceLabel).toBe('Paramedic Handover (Audio)');

      const updated = await updateInput(p.id, input.id, {
        processingStatus: 'completed',
        extractedText: '24yo male RTA',
      });
      expect(updated.processingStatus).toBe('completed');
      expect(updated.extractedText).toBe('24yo male RTA');
    });
  });

  describe('Clinical Facts Repository', () => {
    it('adds, retrieves, and updates clinical facts', async () => {
      const p = await createPatient({ name: 'Alex Carter' });

      const fact = await addClinicalFact(p.id, {
        patientId: p.id,
        category: 'allergy',
        value: 'Penicillin allergy',
        confidence: 96,
        sourceInputIds: ['input_1'],
        verificationStatus: 'UNVERIFIED',
      });

      expect(fact.id).toBeDefined();
      expect(fact.verificationStatus).toBe('UNVERIFIED');

      const facts = await getClinicalFacts(p.id);
      expect(facts.length).toBe(1);

      const verified = await updateClinicalFact(p.id, fact.id, {
        verificationStatus: 'VERIFIED',
      });
      expect(verified.verificationStatus).toBe('VERIFIED');
    });
  });

  describe('Clinical Conflicts Repository', () => {
    it('records a clinical conflict with invariant requiresHumanReview', async () => {
      const p = await createPatient({ name: 'Alex Carter' });

      const conflict = await addConflict(p.id, {
        patientId: p.id,
        severity: 'critical',
        topic: 'Allergy / Medication Conflict',
        description: 'Penicillin allergy conflicts with prescribed Amoxicillin.',
        conflictingFactIds: ['fact_1', 'fact_2'],
        requiresHumanReview: true,
      });

      expect(conflict.requiresHumanReview).toBe(true);
      expect(conflict.status).toBe('pending');

      const conflicts = await getConflicts(p.id);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].severity).toBe('critical');

      const resolved = await updateConflict(p.id, conflict.id, {
        status: 'resolved',
      });
      expect(resolved.status).toBe('resolved');
      expect(resolved.requiresHumanReview).toBe(true); // preserved
    });
  });

  describe('Recommended Actions & Human Invariant', () => {
    it('enforces human approval flow and records audit events', async () => {
      const p = await createPatient({ name: 'Alex Carter' });

      const action = await addRecommendedAction(p.id, {
        patientId: p.id,
        priority: 'high',
        action: 'Allocate Trauma Bay',
        rationale: 'Hypotensive blunt chest trauma',
        sourceFactIds: ['fact_1'],
        requiresHumanApproval: true,
      });

      expect(action.status).toBe('pending');
      expect(action.requiresHumanApproval).toBe(true);

      const allActions = await getRecommendedActions(p.id);
      expect(allActions.length).toBe(1);
      expect(allActions[0].id).toBe(action.id);

      // Verify audit event was logged automatically on recommendation
      const auditsAfterRec = await getAuditEvents(p.id);
      expect(auditsAfterRec.some((a) => a.type === 'action_recommended')).toBe(true);

      // Clinician explicitly approves action
      const approved = await approveAction(p.id, action.id, 'Dr. Arjun Rao');
      expect(approved.status).toBe('approved');
      expect(approved.approvedBy).toBe('Dr. Arjun Rao');
      expect(approved.approvedAt).toBeDefined();

      // Verify audit event was logged on approval
      const auditsAfterApprove = await getAuditEvents(p.id);
      const approveEvent = auditsAfterApprove.find((a) => a.type === 'action_approved');
      expect(approveEvent).toBeDefined();
      expect(approveEvent?.actor).toBe('clinician');
      expect(approveEvent?.description).toContain('Dr. Arjun Rao');

      // Cannot approve already approved action
      await expect(approveAction(p.id, action.id, 'Dr. Arjun Rao')).rejects.toThrow(
        /current status is 'approved'/
      );
    });

    it('handles clinician rejection with reason and direct audit log', async () => {
      const p = await createPatient({ name: 'Alex Carter' });

      const action = await addRecommendedAction(p.id, {
        patientId: p.id,
        priority: 'medium',
        action: 'Administer Morphine 5mg',
        rationale: 'Severe pain',
        sourceFactIds: ['fact_1'],
        requiresHumanApproval: true,
      });

      const rejected = await rejectAction(
        p.id,
        action.id,
        'Dr. Arjun Rao',
        'Patient hemodynamically unstable, defer analgesia'
      );
      expect(rejected.status).toBe('rejected');
      expect(rejected.rejectedBy).toBe('Dr. Arjun Rao');
      expect(rejected.rejectionReason).toContain('hemodynamically unstable');

      // Add manual audit entry
      await addAuditEvent(p.id, {
        type: 'risk_detected',
        actor: 'clinician',
        description: 'Clinician confirmed hemodynamic instability.',
      });

      const audits = await getAuditEvents(p.id);
      const rejectEvent = audits.find((a) => a.type === 'action_rejected');
      expect(rejectEvent).toBeDefined();
      const riskEvent = audits.find((a) => a.type === 'risk_detected');
      expect(riskEvent).toBeDefined();
    });
  });

  describe('Hospital Resources Repository', () => {
    it('reads and updates simulated hospital resources', async () => {
      await setResource({
        id: 'res_trauma_bay',
        type: 'trauma_bay',
        name: 'Trauma Bays',
        quantity: 5,
        available: 2,
        location: 'Wing A',
        updatedAt: new Date().toISOString(),
      });

      const list = await getResources();
      expect(list.length).toBe(1);
      expect(list[0].available).toBe(2);

      const updated = await updateResource('res_trauma_bay', {
        available: 1,
      });
      expect(updated.available).toBe(1);
    });
  });

  describe('Synthetic Demo Data Seeding', () => {
    it('seeds Patient #047 and returns expected counts matching design', async () => {
      const result = await seedDemoData({ forceInMemoryOnly: true });

      expect(result.patient.id).toBe('patient_047');
      expect(result.patient.name).toBe('Alex Carter');
      expect(result.inputsCount).toBe(4);
      expect(result.factsCount).toBe(5);
      expect(result.conflictsCount).toBe(2);
      expect(result.actionsCount).toBe(3);
      expect(result.resourcesCount).toBe(5);
      expect(result.auditEventsCount).toBe(8);

      // Verify patient #047 can be fetched via repository
      const p047 = await getPatient('patient_047');
      expect(p047).not.toBeNull();
      expect(p047?.vitals?.heartRate).toBe(128);
      expect(p047?.vitals?.bloodPressure).toBe('86/54 mmHg');
      expect(p047?.sbar?.situation).toContain('24-year-old male');

      // Verify conflicts
      const conflicts = await getConflicts('patient_047');
      expect(conflicts.length).toBe(2);
      expect(conflicts.some((c) => c.severity === 'critical')).toBe(true);

      // Verify resources
      const resources = await getResources();
      expect(resources.length).toBe(5);
    });
  });
});

