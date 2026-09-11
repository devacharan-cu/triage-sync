import { ai, MODELS } from '../config';
import { videoExtractionSchema, VideoExtraction } from '../schema/extraction';

export async function extractFromVideo(
  base64Video: string,
  mimeType: string,
  additionalContext?: string
): Promise<VideoExtraction> {
  const prompt = `
You are an expert triage AI. You will receive a video clip representing a patient incident, scene, or paramedic handover.
Your task is to analyze BOTH the visual content AND the available audio.

REQUIREMENTS:
1. Extract clinical facts based on OBSERVABLE details and SPOKEN audio. This includes:
   - Visible injuries, bleeding, patient position/consciousness.
   - Scene details (mechanism of injury, e.g., high-speed crash, fall, helmet/seatbelt presence).
   - Any spoken facts by paramedics/bystanders (medications, allergies, history, vitals).
2. If there is a clear, structured spoken handover, summarize it into an SBAR object (Situation, Background, Assessment, Recommendation). If not, omit the SBAR.
3. Provide a confidence score (0-100) for each fact. Do not invent details that cannot be observed or heard.

Respond ONLY with valid JSON matching this TypeScript interface:
{
  "sbar": {
    "situation": "string",
    "background": "string",
    "assessment": "string",
    "recommendation": "string"
  }, // ONLY include if there is a spoken handover
  "facts": [
    {
      "category": "allergy" | "medication" | "medical_history" | "symptom" | "vital" | "diagnosis",
      "value": "string",
      "confidence": number,
      "sourceTextQuote": "string" // quote what was heard or describe what was seen
    }
  ]
}

${additionalContext ? `Additional Context: ${additionalContext}` : ''}
  `.trim();

  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX_REASONING, // Pro is better for video multi-modal reasoning
    contents: [
      { role: 'user', parts: [
        { text: prompt },
        { inlineData: { data: base64Video, mimeType } }
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
  return videoExtractionSchema.parse(json);
}
