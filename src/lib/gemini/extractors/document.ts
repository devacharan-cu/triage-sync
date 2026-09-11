import { ai, MODELS } from '../config';
import { documentExtractionSchema, DocumentExtraction } from '../schema/extraction';

export async function extractFromDocument(
  base64Data: string,
  mimeType: string,
  additionalContext?: string
): Promise<DocumentExtraction> {
  const prompt = `
You are an expert clinical data extraction AI. You will receive an image or document containing medical history, prescriptions, or clinical notes.
Your task is to extract information into a structured JSON format.

REQUIREMENTS:
1. Extract all clinical facts (allergies, medications, medical history, symptoms, vitals, diagnosis).
2. Preserve uncertainty. Never hallucinate unreadable information. If a word is illegible or ambiguous, either skip it or assign a very low confidence score.
3. Provide a confidence score (0-100) for each fact.
4. Include a quote of the source text if possible.

Respond ONLY with valid JSON matching this TypeScript interface:
{
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
    model: MODELS.COMPLEX_REASONING, // Using Pro model for document/handwriting OCR reasoning
    contents: [
      { role: 'user', parts: [
        { text: prompt },
        { inlineData: { data: base64Data, mimeType } }
      ]}
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    }
  });

  const text = response.text();
  if (!text) {
    throw new Error('No text returned from Gemini API.');
  }

  const json = JSON.parse(text);
  return documentExtractionSchema.parse(json);
}
