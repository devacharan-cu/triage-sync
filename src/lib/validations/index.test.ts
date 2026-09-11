import { describe, it, expect } from 'vitest';
import {
  patientSchema,
  createPatientSchema,
  clinicalFactSchema,
  clinicalConflictSchema,
  recommendedActionSchema,
  approveActionSchema,
  rejectActionSchema,
  hospitalResourceSchema,
  auditEventSchema,
} from './index';

describe('Validation Schemas', () => {
  describe('Patient Schema', () => {
    it('validates a correct patient record', () => {
      const valid = {
        id: 'patient_047',
        name: 'Alex Carter',
        age: 24,
        gender: 'Male',
        state: 'CONFLICT_DETECTED',
        severity: 'CRITICAL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const result = patientSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid patient state', () => {
      const invalid = {
        id: 'patient_047',
        state: 'UNKNOWN_STATE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const result = patientSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('creates patient with default state UPLOADED', () => {
      const input = {
        name: 'Alex Carter',
      };
      const result = createPatientSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state).toBe('UPLOADED');
      }
    });
  });

  describe('Clinical Fact Schema', () => {
    it('validates a valid clinical fact', () => {
      const validFact = {
        id: 'fact_1',
        patientId: 'patient_047',
        category: 'allergy',
        value: 'Penicillin allergy',
        confidence: 96,
        sourceInputIds: ['input_1'],
        verificationStatus: 'UNVERIFIED',
        createdAt: new Date().toISOString(),
      };
      const result = clinicalFactSchema.safeParse(validFact);
      expect(result.success).toBe(true);
    });

    it('rejects empty fact value or invalid confidence', () => {
      const invalidFact = {
        id: 'fact_1',
        patientId: 'patient_047',
        category: 'allergy',
        value: '',
        confidence: 150, // Out of bounds
        sourceInputIds: [],
        verificationStatus: 'UNVERIFIED',
        createdAt: new Date().toISOString(),
      };
      const result = clinicalFactSchema.safeParse(invalidFact);
      expect(result.success).toBe(false);
    });
  });

  describe('Clinical Conflict Schema', () => {
    it('enforces requiresHumanReview: true invariant', () => {
      const valid = {
        id: 'conflict_1',
        patientId: 'patient_047',
        severity: 'critical',
        topic: 'Penicillin Allergy Conflict',
        description: 'Penicillin allergy conflicts with prescribed Amoxicillin.',
        conflictingFactIds: ['fact_1', 'fact_2'],
        requiresHumanReview: true,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      expect(clinicalConflictSchema.safeParse(valid).success).toBe(true);

      const invalid = { ...valid, requiresHumanReview: false };
      expect(clinicalConflictSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('Recommended Action Schema & Human Approval', () => {
    it('enforces requiresHumanApproval: true invariant', () => {
      const valid = {
        id: 'action_1',
        patientId: 'patient_047',
        priority: 'high',
        action: 'Allocate Trauma Bay',
        rationale: 'Hypotensive blunt chest trauma',
        sourceFactIds: ['fact_1'],
        requiresHumanApproval: true,
        status: 'pending',
      };
      expect(recommendedActionSchema.safeParse(valid).success).toBe(true);

      const invalid = { ...valid, requiresHumanApproval: false };
      expect(recommendedActionSchema.safeParse(invalid).success).toBe(false);
    });

    it('validates clinician approval payload', () => {
      expect(approveActionSchema.safeParse({ approvedBy: 'Dr. Arjun Rao' }).success).toBe(true);
      expect(approveActionSchema.safeParse({ approvedBy: '' }).success).toBe(false);
    });

    it('validates clinician rejection payload', () => {
      expect(
        rejectActionSchema.safeParse({
          rejectedBy: 'Dr. Arjun Rao',
          reason: 'Patient already stabilized',
        }).success
      ).toBe(true);
      expect(rejectActionSchema.safeParse({ rejectedBy: '' }).success).toBe(false);
    });
  });

  describe('Hospital Resource Schema', () => {
    it('validates valid hospital resource', () => {
      const valid = {
        id: 'res_1',
        type: 'trauma_bay',
        name: 'Trauma Bay 1',
        quantity: 5,
        available: 2,
        location: 'Wing A',
        updatedAt: new Date().toISOString(),
      };
      expect(hospitalResourceSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects negative quantities', () => {
      const invalid = {
        id: 'res_1',
        type: 'trauma_bay',
        name: 'Trauma Bay 1',
        quantity: -1,
        available: 2,
        location: 'Wing A',
        updatedAt: new Date().toISOString(),
      };
      expect(hospitalResourceSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('Audit Event Schema', () => {
    it('validates audit event creation', () => {
      const event = {
        id: 'audit_1',
        patientId: 'patient_047',
        type: 'action_approved',
        actor: 'clinician',
        description: 'Approved blood preparation',
        createdAt: new Date().toISOString(),
      };
      expect(auditEventSchema.safeParse(event).success).toBe(true);
    });
  });
});
