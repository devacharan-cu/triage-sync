import { z } from 'zod';

// ==========================================
// PATIENT SCHEMAS
// ==========================================

export const patientStateSchema = z.enum([
  'UPLOADED',
  'PROCESSING',
  'EXTRACTED',
  'VALIDATED',
  'CROSS_REFERENCED',
  'CONFLICT_DETECTED',
  'ACTION_PENDING',
  'HUMAN_REVIEW',
  'HUMAN_APPROVED',
  'COMPLETED',
  'ANALYSIS_FAILED',
  'HUMAN_REVIEW_REQUIRED',
]);

export const patientSeveritySchema = z.enum(['NORMAL', 'WARNING', 'CRITICAL']);

export const patientVitalsSchema = z.object({
  heartRate: z.number().nonnegative().optional(),
  bloodPressure: z.string().optional(),
  oxygenSaturation: z.number().min(0).max(100).optional(),
  temperature: z.number().positive().optional(),
  respiratoryRate: z.number().nonnegative().optional(),
});

export const patientSBARSchema = z.object({
  situation: z.string().min(1, 'Situation is required'),
  background: z.string().min(1, 'Background is required'),
  assessment: z.string().min(1, 'Assessment is required'),
  recommendation: z.string().min(1, 'Recommendation is required'),
  extractedAt: z.string().optional(),
});

export const patientSchema = z.object({
  id: z.string().min(1, 'Patient ID is required'),
  name: z.string().optional(),
  age: z.number().int().nonnegative().optional(),
  gender: z.string().optional(),
  incidentId: z.string().optional(),
  incidentDescription: z.string().optional(),
  arrivalTime: z.string().optional(),
  triageCategory: z.string().optional(),
  primaryComplaint: z.string().optional(),
  statusDescription: z.string().optional(),
  state: patientStateSchema,
  severity: patientSeveritySchema.optional(),
  vitals: patientVitalsSchema.optional(),
  sbar: patientSBARSchema.optional(),
  createdAt: z.string().min(1, 'Created timestamp required'),
  updatedAt: z.string().min(1, 'Updated timestamp required'),
  archived: z.boolean().optional(),
});

export const createPatientSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  age: z.number().int().nonnegative().optional(),
  gender: z.string().optional(),
  incidentId: z.string().optional(),
  incidentDescription: z.string().optional(),
  arrivalTime: z.string().optional(),
  triageCategory: z.string().optional(),
  primaryComplaint: z.string().optional(),
  statusDescription: z.string().optional(),
  state: patientStateSchema.default('UPLOADED'),
  severity: patientSeveritySchema.optional(),
  vitals: patientVitalsSchema.optional(),
  sbar: patientSBARSchema.optional(),
  archived: z.boolean().optional(),
});

// ==========================================
// INPUT SCHEMAS
// ==========================================

export const inputTypeSchema = z.enum(['audio', 'image', 'document', 'text', 'video']);

export const inputProcessingStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
]);

export const patientInputSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  type: inputTypeSchema,
  storagePath: z.string().min(1),
  extractedText: z.string().optional(),
  sourceLabel: z.string().min(1),
  uploadedAt: z.string().min(1),
  processingStatus: inputProcessingStatusSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createInputSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().optional(),
  type: inputTypeSchema,
  storagePath: z.string().min(1),
  extractedText: z.string().optional(),
  sourceLabel: z.string().min(1),
  uploadedAt: z.string().optional(),
  processingStatus: inputProcessingStatusSchema.default('pending'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ==========================================
// CLINICAL FACT SCHEMAS
// ==========================================

export const factCategorySchema = z.enum([
  'allergy',
  'medication',
  'medical_history',
  'symptom',
  'vital',
  'diagnosis',
]);

export const verificationStatusSchema = z.enum(['VERIFIED', 'UNVERIFIED']);

export const clinicalFactSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  category: factCategorySchema,
  value: z.string().min(1, 'Fact value cannot be empty'),
  confidence: z.number().min(0).max(100),
  sourceInputIds: z.array(z.string()),
  verificationStatus: verificationStatusSchema,
  createdAt: z.string().min(1),
});

export const createClinicalFactSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().optional(),
  category: factCategorySchema,
  value: z.string().min(1, 'Fact value cannot be empty'),
  confidence: z.number().min(0).max(100),
  sourceInputIds: z.array(z.string()),
  verificationStatus: verificationStatusSchema.default('UNVERIFIED'),
  createdAt: z.string().optional(),
});

// ==========================================
// CLINICAL CONFLICT SCHEMAS
// ==========================================

export const conflictSeveritySchema = z.enum(['critical', 'high', 'medium', 'low']);

export const clinicalConflictSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  severity: conflictSeveritySchema,
  topic: z.string().min(1),
  description: z.string().min(1),
  conflictingFactIds: z.array(z.string()),
  requiresHumanReview: z.literal(true),
  status: z.enum(['pending', 'resolved']),
  createdAt: z.string().min(1),
  type: z.enum(['conflict', 'missed_signal', 'confirmation', 'addition', 'interpretation_change']).optional(),
  tags: z.array(z.string()).optional(),
});

export const createClinicalConflictSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().optional(),
  severity: conflictSeveritySchema,
  topic: z.string().min(1),
  description: z.string().min(1),
  conflictingFactIds: z.array(z.string()),
  requiresHumanReview: z.literal(true).default(true),
  status: z.enum(['pending', 'resolved']).default('pending'),
  createdAt: z.string().optional(),
  type: z.enum(['conflict', 'missed_signal', 'confirmation', 'addition', 'interpretation_change']).optional(),
  tags: z.array(z.string()).optional(),
});

// ==========================================
// RECOMMENDED ACTION SCHEMAS
// ==========================================

export const actionPrioritySchema = z.union([
  z.enum(['critical', 'high', 'medium', 'low']),
  z.number().int().min(1).max(5),
]);

export const actionStatusSchema = z.enum(['pending', 'approved', 'rejected']);

export const recommendedActionSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  priority: actionPrioritySchema,
  action: z.string().min(1, 'Action description is required'),
  rationale: z.string().min(1, 'Action rationale is required'),
  sourceFactIds: z.array(z.string()),
  requiresHumanApproval: z.literal(true),
  status: actionStatusSchema,
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  rejectedBy: z.string().optional(),
  rejectedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const createRecommendedActionSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().optional(),
  priority: actionPrioritySchema,
  action: z.string().min(1, 'Action description is required'),
  rationale: z.string().min(1, 'Action rationale is required'),
  sourceFactIds: z.array(z.string()),
  requiresHumanApproval: z.literal(true).default(true),
  status: actionStatusSchema.default('pending'),
});

export const approveActionSchema = z.object({
  approvedBy: z.string().min(1, 'Clinician identifier is required to approve action'),
});

export const rejectActionSchema = z.object({
  rejectedBy: z.string().min(1, 'Clinician identifier is required to reject action'),
  reason: z.string().optional(),
});

// ==========================================
// HOSPITAL RESOURCE SCHEMAS
// ==========================================

export const resourceTypeSchema = z.enum([
  'trauma_bay',
  'icu_bed',
  'blood',
  'ventilator',
  'operating_room',
]);

export const hospitalResourceSchema = z.object({
  id: z.string().min(1),
  type: resourceTypeSchema,
  name: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  available: z.number().int().nonnegative(),
  location: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const createHospitalResourceSchema = z.object({
  id: z.string().optional(),
  type: resourceTypeSchema,
  name: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  available: z.number().int().nonnegative(),
  location: z.string().min(1),
  updatedAt: z.string().optional(),
});

// ==========================================
// AUDIT EVENT SCHEMAS
// ==========================================

export const auditEventTypeSchema = z.enum([
  'patient_arrived',
  'input_uploaded',
  'analysis_started',
  'analysis_completed',
  'analysis_failed',
  'conflict_detected',
  'risk_detected',
  'action_recommended',
  'action_approved',
  'action_rejected',
]);

export const auditActorSchema = z.enum(['ai', 'clinician', 'system']);

export const auditEventSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  type: auditEventTypeSchema,
  actor: auditActorSchema,
  description: z.string().min(1),
  createdAt: z.string().min(1),
});

export const createAuditEventSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().optional(),
  type: auditEventTypeSchema,
  actor: auditActorSchema,
  description: z.string().min(1),
  createdAt: z.string().optional(),
});

