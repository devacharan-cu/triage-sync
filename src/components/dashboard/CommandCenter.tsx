'use client';

import { useState } from 'react';
import { usePatientData } from '@/hooks/usePatientData';
import { PatientHeader } from './PatientHeader';
import { PatientSelector } from './PatientSelector';
import { InputStream } from './InputStream';
import { SbarCard } from './SbarCard';
import { Vitals3DModel } from '../3d/Vitals3DModel';
import { ClinicalAlerts } from './ClinicalAlerts';
import { RecommendedActions } from './RecommendedActions';
import { ClinicalFacts } from './ClinicalFacts';
import { AuditTrail } from './AuditTrail';
import { HospitalResources } from './HospitalResources';
import { EvidenceViewer } from './EvidenceViewer';
import { Loader2 } from 'lucide-react';
import { approveAction, rejectAction } from '@/lib/firebase/repositories/actions';
import { ClinicalConflict, RecommendedAction } from '@/types';

export function CommandCenter({ initialPatientId }: { initialPatientId: string }) {
  const [patientId, setPatientId] = useState(initialPatientId);
  const { patient, otherPatients, inputs, facts, conflicts, actions, auditEvents, resources, loading } = usePatientData(patientId);
  
  const [evidenceItem, setEvidenceItem] = useState<ClinicalConflict | RecommendedAction | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <p className="font-mono text-sm text-neutral-400 tracking-widest">INITIALIZING_COMMAND_CENTER</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="p-6 border border-red-900/50 bg-red-950/20 rounded-xl max-w-md text-center">
          <h2 className="text-red-500 font-bold mb-2">Patient Not Found</h2>
          <p className="text-sm text-neutral-300">Unable to load data for patient: {patientId}</p>
          <div className="mt-4 flex justify-center">
             <PatientSelector 
               currentPatientId={patientId}
               patients={otherPatients}
               onSelect={setPatientId}
             />
          </div>
        </div>
      </div>
    );
  }

  // Action handlers
  const handleApproveAction = async (actionId: string) => {
    try {
      await approveAction(patientId, actionId, 'Dr. Triage Demo');
    } catch (e) {
      console.error(e);
      alert('Failed to approve action.');
    }
  };

  const handleRejectAction = async (actionId: string) => {
    try {
      const reason = prompt('Please provide a reason for rejection (optional):') || 'No reason provided';
      await rejectAction(patientId, actionId, 'Dr. Triage Demo', reason);
    } catch (e) {
      console.error(e);
      alert('Failed to reject action.');
    }
  };

  // Combine patient and otherPatients for the selector
  const allPatients = [patient, ...otherPatients];

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-start mb-2">
          <PatientSelector 
            currentPatientId={patientId}
            patients={allPatients}
            onSelect={setPatientId}
          />
        </div>
        
        <PatientHeader patient={patient} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Input Stream & Audit */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <InputStream inputs={inputs} patientId={patientId} />
            
            <div className="border-t border-neutral-800 pt-6 mt-2">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Audit Trail</h3>
              <div className="max-h-[500px] overflow-y-auto pr-2">
                <AuditTrail events={auditEvents} />
              </div>
            </div>
          </div>
          
          {/* CENTER COLUMN: SBAR, 3D, Facts */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <Vitals3DModel severity={patient.severity} />
            <SbarCard sbar={patient.sbar} />
            
            <div className="mt-4">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Extracted Clinical Facts</h3>
              <ClinicalFacts facts={facts} />
            </div>
          </div>
          
          {/* RIGHT COLUMN: Alerts, Actions, Resources */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div>
              <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {conflicts.length > 0 && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  )}
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Clinical Alerts
              </h3>
              <ClinicalAlerts 
                conflicts={conflicts} 
                onReview={conflict => setEvidenceItem(conflict)} 
              />
            </div>
            
            <div className="mt-4">
              <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">Recommended Actions</h3>
              <RecommendedActions 
                actions={actions} 
                onApprove={handleApproveAction}
                onReject={handleRejectAction}
              />
            </div>

            <div className="mt-4 border-t border-neutral-800 pt-6">
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">Hospital Resources</h3>
              <HospitalResources resources={resources} />
            </div>
          </div>
        </div>
      </div>
      
      {evidenceItem && (
        <EvidenceViewer
          isOpen={!!evidenceItem}
          onClose={() => setEvidenceItem(null)}
          title={'topic' in evidenceItem ? evidenceItem.topic : 'action' in evidenceItem ? evidenceItem.action : 'Fact'}
          item={evidenceItem}
          inputs={inputs}
          facts={facts}
        />
      )}
    </div>
  );
}
