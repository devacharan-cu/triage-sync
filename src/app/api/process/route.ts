import { NextResponse } from 'next/server';
import { processInputPipeline } from '@/lib/gemini/pipeline';
import { addInput, getInputs } from '@/lib/firebase/repositories/inputs';
import { getPatient } from '@/lib/firebase/repositories/patients';
import { getClinicalFacts } from '@/lib/firebase/repositories/clinicalFacts';
import { getConflicts } from '@/lib/firebase/repositories/conflicts';
import { getAuditEvents } from '@/lib/firebase/repositories/audit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patientId, base64Data, mimeType, sourceLabel, type } = body;

    if (!patientId || !base64Data || !mimeType || !sourceLabel || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const patient = await getPatient(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // 1. Create the input record
    const input = await addInput(patientId, {
      type,
      sourceLabel,
      storagePath: 'memory://' + sourceLabel,
      processingStatus: 'pending',
      uploadedAt: new Date().toISOString()
    });

    // 2. Fetch historical facts
    const historicalFacts = await getClinicalFacts(patientId);

    // 3. Run pipeline
    await processInputPipeline(
      input,
      base64Data,
      mimeType,
      historicalFacts,
      patient.vitals
    );

    // Fetch all updated entities to return to client (for in-memory sync)
    const updatedInputs = await getInputs(patientId);
    const updatedFacts = await getClinicalFacts(patientId);
    const updatedConflicts = await getConflicts(patientId);
    const updatedAuditEvents = await getAuditEvents(patientId);

    return NextResponse.json({ 
      success: true, 
      inputId: input.id,
      syncData: {
        inputs: updatedInputs,
        facts: updatedFacts,
        conflicts: updatedConflicts,
        auditEvents: updatedAuditEvents
      }
    });

  } catch (error) {
    console.error('API Error in /api/process:', error);
    return NextResponse.json({ 
      error: 'Analysis incomplete — human review required',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
