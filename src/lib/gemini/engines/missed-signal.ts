import { ai, MODELS } from '../config';
import { engineMissedSignalsSchema, MissedSignal } from '../schema/engines';
import { ClinicalFact, PatientSBAR, PatientVitals } from '../../../types';

export async function detectMissedSignals(
  historicalFacts: ClinicalFact[],
  currentSBAR: PatientSBAR | undefined,
  currentVitals: PatientVitals | undefined
): Promise<MissedSignal[]> {
  const prompt = `
You are a clinical missed-signal engine.
Your job is to compare historical clinical facts against the current triage situation (SBAR and vitals) and identify potentially important omitted signals.

Rules:
1. Identify historical facts (like a severe pre-existing condition, or chronic medication) that are not mentioned or accounted for in the current SBAR or vitals, but could be highly relevant to the current situation.
2. DO NOT DIAGNOSE. Just surface the omitted signal with source context.
3. Preserve uncertainty. Frame things as "Potential omission" or "Noted in history but absent in handover".
4. Output ONLY valid JSON matching this schema:
{
  "missedSignals": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "topic": "string (Short topic)",
      "description": "string (Explanation of why this might be a missed signal)",
      "relatedFactIds": ["string"],
      "tags": ["string"]
    }
  ]
}

Historical Facts:
${JSON.stringify(historicalFacts.map(f => ({ id: f.id, category: f.category, value: f.value })), null, 2)}

Current SBAR:
${JSON.stringify(currentSBAR || {}, null, 2)}

Current Vitals:
${JSON.stringify(currentVitals || {}, null, 2)}
  `.trim();

  const response = await ai.models.generateContent({
    model: MODELS.FAST_INFERENCE,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error('No text returned from Gemini API.');
  }

  const json = JSON.parse(text);
  const parsed = engineMissedSignalsSchema.parse(json);
  
  return parsed.missedSignals;
}
