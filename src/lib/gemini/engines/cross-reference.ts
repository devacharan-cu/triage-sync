import { ai, MODELS } from '../config';
import { ClinicalFact, PatientSBAR, PatientVitals } from '../../../types';
import { z } from 'zod';

export const crossReferenceSchema = z.object({
  signals: z.array(z.object({
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    topic: z.string(),
    description: z.string(),
    relatedFactIds: z.array(z.string()),
    type: z.enum(['conflict', 'missed_signal', 'confirmation', 'addition', 'interpretation_change']),
    tags: z.array(z.string())
  }))
});

export async function generateCrossReference(
  newFacts: ClinicalFact[],
  historicalFacts: ClinicalFact[],
  currentSBAR?: PatientSBAR,
  currentVitals?: PatientVitals
) {
  const prompt = `
You are the TRIAGE-SYNC AI Clinical Intelligence Layer.
Your primary capability is CROSS-REFERENCE. You are receiving NEW clinical facts extracted from a recent input, and you must synthesize them against the patient's existing historical record.

For the new input facts, you must ask and answer:
1. What does this confirm? (type: "confirmation")
2. What does this contradict? (type: "conflict")
3. What important information does this add? (type: "addition")
4. What previous information changes the interpretation? (type: "interpretation_change")
5. What relevant detail could a human easily miss? (type: "missed_signal")
6. What conflicts or risk signals exist across different sources? (type: "conflict" or "missed_signal")

CRITICAL RULES:
- DO NOT invent missing patient information. If you do not know, do not assume.
- Show supporting source evidence (reference the fact IDs).
- Only output the most relevant and clinically significant signals. Do not clutter with trivial confirmations unless they are medically crucial (e.g. confirming a previously suspected allergy).
- Return valid JSON matching the exact schema requested.

New Extracted Facts (The trigger for this analysis):
${JSON.stringify(newFacts.map(f => ({ id: f.id, category: f.category, value: f.value })), null, 2)}

Existing Historical Facts:
${JSON.stringify(historicalFacts.map(f => ({ id: f.id, category: f.category, value: f.value })), null, 2)}

Current SBAR Handover (if any):
${JSON.stringify(currentSBAR || {}, null, 2)}

Current Vitals (if any):
${JSON.stringify(currentVitals || {}, null, 2)}
  `.trim();

  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX_REASONING,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: crossReferenceSchema as unknown as import("@google/genai").Schema,
      temperature: 0.1,
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error('No text returned from Gemini API.');
  }

  const json = JSON.parse(text);
  return crossReferenceSchema.parse(json).signals;
}
