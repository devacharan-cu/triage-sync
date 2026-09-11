import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK
// Uses GEMINI_API_KEY from the environment variables automatically if passed empty,
// or we can explicitly pass it.
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const MODELS = {
  // Use Flash 2.5 for latency-sensitive application inference as requested
  FAST_INFERENCE: 'gemini-2.5-flash',
  // Use Pro for difficult reasoning if genuinely needed
  COMPLEX_REASONING: 'gemini-2.5-pro',
};
