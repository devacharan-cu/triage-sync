import { z } from 'zod';
import { conflictSeveritySchema } from '../../validations/index';

export const detectedConflictSchema = z.object({
  severity: conflictSeveritySchema,
  topic: z.string(),
  description: z.string(),
  conflictingFactIds: z.array(z.string()),
});

export const engineConflictsSchema = z.object({
  conflicts: z.array(detectedConflictSchema),
});

export const missedSignalSchema = z.object({
  severity: conflictSeveritySchema,
  topic: z.string(),
  description: z.string(),
  relatedFactIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const engineMissedSignalsSchema = z.object({
  missedSignals: z.array(missedSignalSchema),
});

export type DetectedConflict = z.infer<typeof detectedConflictSchema>;
export type MissedSignal = z.infer<typeof missedSignalSchema>;
