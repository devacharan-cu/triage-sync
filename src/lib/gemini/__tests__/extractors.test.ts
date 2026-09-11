import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractFromAudio } from '../extractors/audio';
import { extractFromDocument } from '../extractors/document';
import { ai } from '../config';
import { ZodError } from 'zod';

vi.mock('../config', () => ({
  ai: {
    models: {
      generateContent: vi.fn()
    }
  },
  MODELS: {
    FAST_INFERENCE: 'mock-flash',
    COMPLEX_REASONING: 'mock-pro'
  }
}));

describe('Audio Extractor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse valid audio extraction JSON correctly', async () => {
    const mockResponse = {
      text: () => JSON.stringify({
        sbar: {
          situation: 'Chest pain',
          background: 'History of HTN',
          assessment: 'Possible MI',
          recommendation: 'EKG immediately'
        },
        facts: [
          {
            category: 'symptom',
            value: 'Chest pain',
            confidence: 95,
            sourceTextQuote: 'patient complains of chest pain'
          }
        ]
      })
    };
    (ai.models.generateContent as any).mockResolvedValue(mockResponse);

    const result = await extractFromAudio('base64audio...', 'audio/mp3');
    
    expect(result.sbar.situation).toBe('Chest pain');
    expect(result.facts).toHaveLength(1);
    expect(result.facts[0].confidence).toBe(95);
  });

  it('should throw Zod error when extraction schema is violated (e.g. missing confidence)', async () => {
    const mockResponse = {
      text: () => JSON.stringify({
        sbar: {
          situation: 'Chest pain',
          background: 'History of HTN',
          assessment: 'Possible MI',
          recommendation: 'EKG immediately'
        },
        facts: [
          {
            category: 'symptom',
            value: 'Chest pain'
            // missing confidence
          }
        ]
      })
    };
    (ai.models.generateContent as any).mockResolvedValue(mockResponse);

    await expect(extractFromAudio('base64audio...', 'audio/mp3')).rejects.toThrow(ZodError);
  });
});

describe('Document Extractor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle uncertainty well by passing through low confidence scores', async () => {
    const mockResponse = {
      text: () => JSON.stringify({
        facts: [
          {
            category: 'medication',
            value: 'Ibuprofen 400mg (Uncertain)',
            confidence: 30, // Low confidence
            sourceTextQuote: 'smudged handwriting'
          }
        ]
      })
    };
    (ai.models.generateContent as any).mockResolvedValue(mockResponse);

    const result = await extractFromDocument('base64image...', 'image/jpeg');
    
    expect(result.facts).toHaveLength(1);
    expect(result.facts[0].confidence).toBeLessThan(50);
  });
});
