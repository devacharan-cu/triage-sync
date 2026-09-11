import { ai, MODELS } from '../config';
import { engineConflictsSchema, DetectedConflict } from '../schema/engines';
import { ClinicalFact } from '../../../types';

export async function detectConflicts(
  facts: ClinicalFact[]
): Promise<DetectedConflict[]> {
  if (facts.length < 2) return [];

  const prompt = `
You are a deterministic clinical safety engine. 
Your job is to cross-reference a list of clinical facts and identify critical conflicts, particularly regarding ALLERGIES and MEDICATIONS.

Rules:
1. Identify any medication in the facts that conflicts with a known allergy in the facts. (e.g., Amoxicillin prescribed when patient has a Penicillin allergy).
2. Identify duplicate or conflicting medications (e.g., two different doses of the same medication).
3. Do NOT invent new facts. ONLY use the provided facts.
4. Output ONLY valid JSON matching this schema:
{
  "conflicts": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "topic": "string (e.g., 'Allergy / Medication Conflict')",
      "description": "string (Detailed explanation of the conflict)",
      "conflictingFactIds": ["string", "string"]
    }
  ]
}

Facts for Review:
${JSON.stringify(
  facts.map(f => ({
    id: f.id,
    category: f.category,
    value: f.value
  })),
  null,
  2
)}
  `.trim();

  const response = await ai.models.generateContent({
    model: MODELS.FAST_INFERENCE,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.0,
    }
  });

  const text = response.text();
  if (!text) {
    throw new Error('No text returned from Gemini API.');
  }

  const json = JSON.parse(text);
  const parsed = engineConflictsSchema.parse(json);
  
  // Basic Deterministic Rule Backup
  // E.g. Exact string matching (highly naive, but fulfills "deterministic rules where possible")
  const deterministicConflicts: DetectedConflict[] = [];
  const allergies = facts.filter(f => f.category === 'allergy');
  const meds = facts.filter(f => f.category === 'medication');
  
  allergies.forEach(a => {
    meds.forEach(m => {
      if (m.value.toLowerCase().includes(a.value.toLowerCase())) {
        // Only add if LLM missed it
        const alreadyFound = parsed.conflicts.some(c => 
          c.conflictingFactIds.includes(a.id) && c.conflictingFactIds.includes(m.id)
        );
        if (!alreadyFound) {
          deterministicConflicts.push({
            severity: 'critical',
            topic: 'Deterministic Allergy Conflict',
            description: \`Medication contains known allergen: \${a.value}\`,
            conflictingFactIds: [a.id, m.id]
          });
        }
      }
    });
  });

  return [...parsed.conflicts, ...deterministicConflicts];
}
