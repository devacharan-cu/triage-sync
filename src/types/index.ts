export type PatientState = 
  | 'UPLOADED'
  | 'PROCESSING'
  | 'EXTRACTED'
  | 'VALIDATED'
  | 'CROSS_REFERENCED'
  | 'CONFLICT_DETECTED'
  | 'ACTION_PENDING'
  | 'HUMAN_REVIEW'
  | 'HUMAN_APPROVED'
  | 'COMPLETED'
  | 'ANALYSIS_FAILED'
  | 'HUMAN_REVIEW_REQUIRED';

export type InputType = 'audio' | 'image' | 'document' | 'text';

export interface PatientInput {
  id: string;
  patientId: string;
  type: InputType;
  storagePath: string;
  extractedText?: string;
  sourceLabel: string;
  uploadedAt: string; // ISO string
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
}

export type FactCategory = 
  | 'allergy'
  | 'medication'
  | 'medical_history'
  | 'symptom'
  | 'vital'
  | 'diagnosis';

export interface ClinicalFact {
  id: string;
  patientId: string;
  category: FactCategory;
  value: string;
  confidence: number;
  sourceInputIds: string[];
  verificationStatus: 'VERIFIED' | 'UNVERIFIED';
  createdAt: string; // ISO string
}

export type ConflictSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ClinicalConflict {
  id: string;
  patientId: string;
  severity: ConflictSeverity;
  topic: string;
  description: string;
  conflictingFactIds: string[];
  requiresHumanReview: true;
  status: 'pending' | 'resolved';
  createdAt: string; // ISO string
  type?: 'conflict' | 'missed_signal';
  tags?: string[];
}

export type ActionPriority = 'critical' | 'high' | 'medium' | 'low' | number;

export interface RecommendedAction {
  id: string;
  patientId: string;
  priority: ActionPriority;
  action: string;
  rationale: string;
  sourceFactIds: string[];
  requiresHumanApproval: true;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string; // ISO string
  rejectedBy?: string;
  rejectedAt?: string; // ISO string
  rejectionReason?: string;
}

export type ResourceType = 
  | 'trauma_bay'
  | 'icu_bed'
  | 'blood'
  | 'ventilator'
  | 'operating_room';

export interface HospitalResource {
  id: string;
  type: ResourceType;
  name: string;
  quantity: number;
  available: number;
  location: string;
  updatedAt: string; // ISO string
}

export type AuditEventType = 
  | 'patient_arrived'
  | 'input_uploaded'
  | 'analysis_started'
  | 'analysis_completed'
  | 'analysis_failed'
  | 'conflict_detected'
  | 'risk_detected'
  | 'action_recommended'
  | 'action_approved'
  | 'action_rejected';

export type AuditActor = 'ai' | 'clinician' | 'system';

export interface AuditEvent {
  id: string;
  patientId: string;
  type: AuditEventType;
  actor: AuditActor;
  description: string;
  createdAt: string; // ISO string
}

export interface PatientVitals {
  heartRate?: number;
  bloodPressure?: string;
  oxygenSaturation?: number;
  temperature?: number;
  respiratoryRate?: number;
}

export interface PatientSBAR {
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  extractedAt?: string;
}

export interface Patient {
  id: string;
  name?: string;
  age?: number;
  gender?: string;
  incidentId?: string;
  incidentDescription?: string;
  arrivalTime?: string;
  triageCategory?: string;
  primaryComplaint?: string;
  statusDescription?: string;
  state: PatientState;
  severity?: 'NORMAL' | 'WARNING' | 'CRITICAL';
  vitals?: PatientVitals;
  sbar?: PatientSBAR;
  createdAt: string;
  updatedAt: string;
}
