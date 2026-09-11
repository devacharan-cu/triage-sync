import { extractFromAudio } from './extractors/audio';
import { extractFromDocument } from './extractors/document';
import { detectConflicts } from './engines/conflict';
import { detectMissedSignals } from './engines/missed-signal';
import { updateInput } from '../firebase/repositories/inputs';
import { addClinicalFact } from '../firebase/repositories/clinicalFacts';
import { addConflict } from '../firebase/repositories/conflicts';
import { addAuditEvent } from '../firebase/repositories/audit';
import { ClinicalFact, PatientSBAR, PatientInput, PatientVitals } from '../../types';

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
      description: \`Started analysis of \${input.type} input: \${input.sourceLabel}\`
    });

    let sbar: PatientSBAR | undefined;
    let extractedFacts: any[] = [];

    // 2. Extraction
    if (input.type === 'audio') {
      const audioResult = await extractFromAudio(base64Data, mimeType);
      sbar = audioResult.sbar;
      extractedFacts = audioResult.facts;
    } else if (input.type === 'image' || input.type === 'document') {
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

    const allFacts = [...historicalFacts, ...savedFacts];

    // 4. Run Conflict Engine
    const conflicts = await detectConflicts(allFacts);
    for (const conflict of conflicts) {
      await addConflict(input.patientId, {
        severity: conflict.severity,
        topic: conflict.topic,
        description: conflict.description,
        conflictingFactIds: conflict.conflictingFactIds,
        type: 'conflict'
      });
      await addAuditEvent(input.patientId, {
        type: 'conflict_detected',
        actor: 'ai',
        description: \`Detected conflict: \${conflict.topic}\`
      });
    }

    // 5. Run Missed-Signal Engine
    const missedSignals = await detectMissedSignals(historicalFacts, sbar, currentVitals);
    for (const signal of missedSignals) {
      await addConflict(input.patientId, {
        severity: signal.severity,
        topic: signal.topic,
        description: signal.description,
        conflictingFactIds: signal.relatedFactIds || [],
        type: 'missed_signal',
        tags: signal.tags
      });
      await addAuditEvent(input.patientId, {
        type: 'risk_detected',
        actor: 'ai',
        description: \`Detected missed signal: \${signal.topic}\`
      });
    }

    // 6. Complete Processing
    await updateInput(input.patientId, input.id, {
      processingStatus: 'completed'
    });

    await addAuditEvent(input.patientId, {
      type: 'analysis_completed',
      actor: 'system',
      description: \`Successfully processed input: \${input.sourceLabel}\`
    });

  } catch (error) {
    console.error('Pipeline Error:', error);
    
    await updateInput(input.patientId, input.id, {
      processingStatus: 'failed'
    });

    await addAuditEvent(input.patientId, {
      type: 'analysis_failed',
      actor: 'system',
      description: \`Failed to process input: \${error instanceof Error ? error.message : String(error)}\`
    });

    throw error;
  }
}
