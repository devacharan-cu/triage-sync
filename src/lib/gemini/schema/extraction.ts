import { z } from 'zod';
import { 
  patientSBARSchema, 
  factCategorySchema 
} from '../../validations/index';

export const extractedFactSchema = z.object({
  category: factCategorySchema,
  value: z.string(),
  confidence: z.number().min(0).max(100),
  sourceTextQuote: z.string().optional(),
});

export const audioExtractionSchema = z.object({
  sbar: patientSBARSchema,
  facts: z.array(extractedFactSchema),
});

export const documentExtractionSchema = z.object({
  facts: z.array(extractedFactSchema),
});

export type ExtractedFact = z.infer<typeof extractedFactSchema>;
export type AudioExtraction = z.infer<typeof audioExtractionSchema>;
export type DocumentExtraction = z.infer<typeof documentExtractionSchema>;

export const videoExtractionSchema = z.object({
  sbar: patientSBARSchema.optional(),
  facts: z.array(extractedFactSchema),
});
export type VideoExtraction = z.infer<typeof videoExtractionSchema>;
