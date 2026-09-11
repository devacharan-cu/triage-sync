import { ai, MODELS } from '../config';
import { audioExtractionSchema, AudioExtraction } from '../schema/extraction';

export async function extractFromAudio(
  base64Audio: string,
  mimeType: string,
  additionalContext?: string
): Promise<AudioExtraction> {
  const prompt = `
You are an expert triage AI. You will receive an audio recording (or transcript) of a paramedic handover.
Your task is to extract information into a structured JSON format.

REQUIREMENTS:
1. Extract an SBAR (Situation, Background, Assessment, Recommendation) summary.
2. Extract all clinical facts (allergies, medications, medical history, symptoms, vitals).
3. Provide a confidence score (0-100) for each fact. Do not hallucinate. If you are unsure, lower the confidence score.

Respond ONLY with valid JSON matching this TypeScript interface:
{
  "sbar": {
    "situation": "string",
    "background": "string",
    "assessment": "string",
    "recommendation": "string"
  },
  "facts": [
    {
      "category": "allergy" | "medication" | "medical_history" | "symptom" | "vital" | "diagnosis",
      "value": "string",
      "confidence": number,
      "sourceTextQuote": "string"
    }
  ]
}

${additionalContext ? `Additional Context: ${additionalContext}` : ''}
  `.trim();

  const response = await ai.models.generateContent({
    model: MODELS.FAST_INFERENCE,
    contents: [
      { role: 'user', parts: [
        { text: prompt },
        { inlineData: { data: base64Audio, mimeType } }
      ]}
    ],
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
  return audioExtractionSchema.parse(json);
}
