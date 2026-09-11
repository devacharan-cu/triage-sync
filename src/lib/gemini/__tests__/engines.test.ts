/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectConflicts } from '../engines/conflict';
import { detectMissedSignals } from '../engines/missed-signal';
import { ai } from '../config';
import { ClinicalFact } from '../../../types';

// Mock the Gemini config
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

describe('Conflict Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect conflicts using LLM output and Zod validation', async () => {
    const mockResponse = {
      text: JSON.stringify({
        conflicts: [
          {
            severity: 'critical',
            topic: 'Allergy / Medication Conflict',
            description: 'Patient is allergic to Penicillin but Amoxicillin is prescribed.',
            conflictingFactIds: ['fact-1', 'fact-2']
          }
        ]
      })
    };
    (ai.models.generateContent as unknown as any).mockResolvedValue(mockResponse);

    const facts: any[] = [
      { id: 'fact-1', category: 'allergy', value: 'Penicillin' },
      { id: 'fact-2', category: 'medication', value: 'Amoxicillin' }
    ];

    const conflicts = await detectConflicts(facts);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].severity).toBe('critical');
    expect(conflicts[0].conflictingFactIds).toContain('fact-1');
  });

  it('should fallback to deterministic rule if LLM misses a direct match', async () => {
    const mockResponse = {
      text: JSON.stringify({ conflicts: [] })
    };
    (ai.models.generateContent as unknown as any).mockResolvedValue(mockResponse);

    const facts: any[] = [
      { id: 'fact-1', category: 'allergy', value: 'Aspirin' },
      { id: 'fact-2', category: 'medication', value: 'Aspirin 81mg' }
    ];

    const conflicts = await detectConflicts(facts);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].topic).toBe('Deterministic Allergy Conflict');
    expect(conflicts[0].conflictingFactIds).toEqual(['fact-1', 'fact-2']);
  });

  it('should throw an error on malformed LLM JSON output', async () => {
    const mockResponse = {
      text: '{"invalid": true' // broken JSON
    };
    (ai.models.generateContent as unknown as any).mockResolvedValue(mockResponse);

    const facts: any[] = [
      { id: 'fact-1', category: 'allergy', value: 'Peanuts' },
      { id: 'fact-2', category: 'medication', value: 'Tylenol' }
    ];

    await expect(detectConflicts(facts)).rejects.toThrow();
  });
});

describe('Missed Signal Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect missed signals without diagnosing', async () => {
    const mockResponse = {
      text: JSON.stringify({
        missedSignals: [
          {
            severity: 'medium',
            topic: 'Historical Asthma',
            description: 'Patient has a history of severe asthma, but respiratory status was not detailed in SBAR.',
            relatedFactIds: ['fact-3'],
            tags: ['respiratory']
          }
        ]
      })
    };
    (ai.models.generateContent as unknown as any).mockResolvedValue(mockResponse);

    const historicalFacts: any[] = [
      { id: 'fact-3', category: 'medical_history', value: 'Severe asthma' }
    ];
    const currentSBAR = {
      situation: 'Fell off bike',
      background: 'No known issues',
      assessment: 'Scraped knee',
      recommendation: 'Bandage'
    };

    const signals = await detectMissedSignals(historicalFacts, currentSBAR, {});
    expect(signals).toHaveLength(1);
    expect(signals[0].severity).toBe('medium');
    expect(signals[0].relatedFactIds).toContain('fact-3');
  });
});
