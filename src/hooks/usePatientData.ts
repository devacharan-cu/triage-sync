import { useState, useEffect } from 'react';
import { subscribePatients } from '@/lib/firebase/repositories/patients';
import { subscribeInputs } from '@/lib/firebase/repositories/inputs';
import { subscribeClinicalFacts } from '@/lib/firebase/repositories/clinicalFacts';
import { subscribeConflicts } from '@/lib/firebase/repositories/conflicts';
import { subscribeRecommendedActions } from '@/lib/firebase/repositories/actions';
import { subscribeAuditEvents } from '@/lib/firebase/repositories/audit';
import { subscribeResources } from '@/lib/firebase/repositories/resources';

import { 
  Patient, PatientInput, ClinicalFact, ClinicalConflict, RecommendedAction, AuditEvent, HospitalResource 
} from '@/types';

export function usePatientData(patientId: string) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [otherPatients, setOtherPatients] = useState<Patient[]>([]);
  const [inputs, setInputs] = useState<PatientInput[]>([]);
  const [facts, setFacts] = useState<ClinicalFact[]>([]);
  const [conflicts, setConflicts] = useState<ClinicalConflict[]>([]);
  const [actions, setActions] = useState<RecommendedAction[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [resources, setResources] = useState<HospitalResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const unsubs = [
      subscribePatients((pts) => {
        if (!mounted) return;
        setPatient(pts.find(p => p.id === patientId) || null);
        setOtherPatients(pts.filter(p => p.id !== patientId));
        setLoading(false);
      }),
      subscribeInputs(patientId, (res) => mounted && setInputs(res)),
      subscribeClinicalFacts(patientId, (res) => mounted && setFacts(res)),
      subscribeConflicts(patientId, (res) => mounted && setConflicts(res)),
      subscribeRecommendedActions(patientId, (res) => mounted && setActions(res)),
      subscribeAuditEvents(patientId, (res) => mounted && setAuditEvents(res)),
      subscribeResources((res) => mounted && setResources(res))
    ];

    return () => {
      mounted = false;
      unsubs.forEach(unsub => unsub());
    };
  }, [patientId]);

  return {
    patient,
    otherPatients,
    inputs,
    facts,
    conflicts,
    actions,
    auditEvents,
    resources,
    loading
  };
}
