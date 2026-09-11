import { ai, MODELS } from '../config';
import { ClinicalFact, PatientSBAR, PatientVitals, ClinicalConflict } from '../../../types';
import { z } from 'zod';

export const recommendationsSchema = z.object({
  recommendations: z.array(z.object({
    priority: z.enum(['critical', 'high', 'medium', 'low']),
    action: z.string(),
    reason: z.string(),
    tags: z.array(z.string())
  }))
});

export async function generateRecommendations(
  allFacts: ClinicalFact[],
  signals: ClinicalConflict[],
  currentSBAR?: PatientSBAR,
  currentVitals?: PatientVitals
) {
  const prompt = `
You are the TRIAGE-SYNC AI Intelligence Layer - Recommendation Engine.
Based on the patient's entire clinical picture, generate recommended actions for the medical team.

CRITICAL RULES:
1. AI cannot autonomously prescribe or act. Recommendations MUST be actionable steps for HUMAN REVIEW.
2. Consider the extracted facts, current vitals, SBAR, and especially the newly generated intelligence signals (conflicts, missed signals).
3. If there is a "conflict" (e.g., patient prescribed medication they are allergic to), recommend withholding/replacing it immediately.
4. If there is a bleeding risk, recommend appropriate lab tests (CBC, PT/INR) or withholding anticoagulants.
5. Provide a short, precise action and a clinical reason.

All Facts:
${JSON.stringify(allFacts.map(f => ({ id: f.id, category: f.category, value: f.value })), null, 2)}

AI Intelligence Signals:
${JSON.stringify(signals.map(s => ({ type: s.type, topic: s.topic, description: s.description })), null, 2)}

SBAR Handover:
${JSON.stringify(currentSBAR || {}, null, 2)}

Vitals:
${JSON.stringify(currentVitals || {}, null, 2)}
  `.trim();

  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX_REASONING,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: recommendationsSchema as unknown as import("@google/genai").Schema,
      temperature: 0.1,
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error('No text returned from Gemini API.');
  }

  const json = JSON.parse(text);
  return recommendationsSchema.parse(json).recommendations;
}
