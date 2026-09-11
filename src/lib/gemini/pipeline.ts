import { updatePatient } from '../firebase/repositories/patients';
import { generateRecommendations } from './engines/recommendations';
import { addRecommendedAction } from '../firebase/repositories/actions';
import { extractFromAudio } from './extractors/audio';
import { extractFromDocument } from './extractors/document';
import { extractFromVideo } from './extractors/video';
import { generateCrossReference } from './engines/cross-reference';
import { updateInput } from '../firebase/repositories/inputs';
import { addClinicalFact } from '../firebase/repositories/clinicalFacts';
import { addConflict } from '../firebase/repositories/conflicts';
import { addAuditEvent } from '../firebase/repositories/audit';
import { ClinicalFact, PatientSBAR, PatientInput, PatientVitals, ClinicalConflict } from '../../types';

export async function processInputPipeline(
  input: PatientInput,
  base64Data: string,
  mimeType: string,
  historicalFacts: ClinicalFact[],
  currentVitals?: PatientVitals
): Promise<void> {
  try {
    // 1. Update status to processing
        await updateInput(input.patientId, input.id, {
      processingStatus: 'processing'
    });

    await addAuditEvent(input.patientId, {
      type: 'analysis_started',
      actor: 'ai',
      description: `Started analysis of \${input.type} input: \${input.sourceLabel}`
    });

    let sbar: PatientSBAR | undefined;
    let extractedFacts: Array<{ category: 'allergy' | 'medication' | 'medical_history' | 'symptom' | 'vital' | 'diagnosis', value: string, confidence: number }> = [];

    // 2. Extraction
    if (input.type === 'audio') {
      const audioResult = await extractFromAudio(base64Data, mimeType);
      sbar = audioResult.sbar;
      extractedFacts = audioResult.facts;
    } else if (input.type === 'video') {
      const videoResult = await extractFromVideo(base64Data, mimeType);
      if (videoResult.sbar) {
        sbar = videoResult.sbar;
      }
      extractedFacts = videoResult.facts;
    } else if (input.type === 'image' || input.type === 'document' || input.type === 'text') {
      const docResult = await extractFromDocument(base64Data, mimeType);
      extractedFacts = docResult.facts;
    }

    // 3. Save Extracted Facts
    const savedFacts: ClinicalFact[] = [];
    for (const fact of extractedFacts) {
      const saved = await addClinicalFact(input.patientId, {
        category: fact.category,
        value: fact.value,
        confidence: fact.confidence,
        sourceInputIds: [input.id],
        verificationStatus: 'UNVERIFIED'
      });
      savedFacts.push(saved as ClinicalFact);
    }

    

    // 4 & 5. Run Cross-Reference Intelligence Engine
    const signals = await generateCrossReference(savedFacts, historicalFacts, sbar, currentVitals);
    for (const signal of signals) {
      await addConflict(input.patientId, {
        severity: signal.severity,
        topic: signal.topic,
        description: signal.description,
        conflictingFactIds: signal.relatedFactIds || [],
        type: signal.type as "conflict" | "missed_signal" | "confirmation" | "addition" | "interpretation_change", // Cast because we extended the type concept
        tags: signal.tags
      });
      await addAuditEvent(input.patientId, {
        type: signal.type === 'conflict' ? 'conflict_detected' : 'risk_detected',
        actor: 'ai',
        description: `AI Intelligence (${signal.type}): ${signal.topic}`
      });
    }

    
    // 5.5 Run Recommendation Engine
    const allFacts = [...historicalFacts, ...savedFacts];
    const savedSignals = [];
    for (const signal of signals) {
       savedSignals.push({
         id: 'temp', patientId: input.patientId, severity: signal.severity, topic: signal.topic,
         description: signal.description, conflictingFactIds: signal.relatedFactIds || [], requiresHumanReview: true, status: 'pending',
        sourceFactIds: [], createdAt: new Date().toISOString(), type: signal.type as "conflict" | "missed_signal" | "confirmation" | "addition" | "interpretation_change"
       });
    }
    const recommendations = await generateRecommendations(allFacts, savedSignals as ClinicalConflict[], sbar, currentVitals);
    for (const rec of recommendations) {
      await addRecommendedAction(input.patientId, {
        priority: rec.priority,
        action: rec.action,
        rationale: rec.reason,
        status: 'pending',
        sourceFactIds: [],
        
      });
      await addAuditEvent(input.patientId, {
        type: 'action_recommended',
        actor: 'ai',
        description: `AI Recommended Action: ${rec.action}`
      });
    }

    // 6. Complete Processing
    await updatePatient(input.patientId, { state: signals.length > 0 ? 'HUMAN_REVIEW_REQUIRED' : 'COMPLETED' });

    await updateInput(input.patientId, input.id, {
      processingStatus: 'completed'
    });

    await addAuditEvent(input.patientId, {
      type: 'analysis_completed',
      actor: 'system',
      description: `Successfully processed input: \${input.sourceLabel}`
    });

  } catch (error) {
    console.error('Pipeline Error:', error);
    
    await updateInput(input.patientId, input.id, {
      processingStatus: 'failed'
    });

    await addAuditEvent(input.patientId, {
      type: 'analysis_failed',
      actor: 'system',
      description: `Failed to process input: \${error instanceof Error ? error.message : String(error)}`
    });

    throw error;
  }
}
