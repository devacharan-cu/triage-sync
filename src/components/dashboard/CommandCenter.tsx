'use client';

import { useState } from 'react';
import { usePatientData } from '@/hooks/usePatientData';
import { PatientHeader } from './PatientHeader';
import { PatientSelector } from './PatientSelector';
import { ThemeToggle } from '../ThemeToggle';
import { InputStream } from './InputStream';
import { SbarCard } from './SbarCard';
import { DynamicAnatomyVisual } from './DynamicAnatomyVisual';
import { ClinicalAlerts } from './ClinicalAlerts';
import { RecommendedActions } from './RecommendedActions';
import { ClinicalFacts } from './ClinicalFacts';
import { AuditTrail } from './AuditTrail';
import { HospitalResources } from './HospitalResources';
import { EvidenceViewer } from './EvidenceViewer';
import { Loader2 } from 'lucide-react';

import { ClinicalConflict, RecommendedAction } from '@/types';

export function CommandCenter({ initialPatientId }: { initialPatientId: string }) {
  const [patientId, setPatientId] = useState(initialPatientId);
  const { patient, otherPatients, inputs, facts, conflicts, actions, auditEvents, resources, loading } = usePatientData(patientId);
  
  const [evidenceItem, setEvidenceItem] = useState<ClinicalConflict | RecommendedAction | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <p className="font-mono text-sm text-neutral-600 dark:text-neutral-400 tracking-widest">Loading Patient Profile...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    // Auto-select first available patient if the hardcoded one isn't found
    if (otherPatients.length > 0 && patientId !== otherPatients[0].id) {
      setTimeout(() => setPatientId(otherPatients[0].id), 0);
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-6 border border-red-900/50 bg-red-950/20 rounded-xl max-w-md text-center">
          <h2 className="text-red-500 font-bold mb-2">Database Empty / Patient Not Found</h2>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">Run <code>npm run seed</code> to populate the database with synthetic Indian patient scenarios.</p>
          {otherPatients.length > 0 && (
            <div className="mt-4 flex justify-center">
               <PatientSelector 
                 currentPatientId={patientId}
                 patients={otherPatients}
                 onSelect={setPatientId}
               />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Action handlers
  const handleApproveAction = async (actionId: string) => {
    try {
      const res = await fetch(`/api/actions/${actionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, approvedBy: 'Dr. Triage Demo' })
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e) {
      console.error(e);
      alert('Failed to approve action.');
    }
  };

  const handleRejectAction = async (actionId: string) => {
    try {
      const reason = prompt('Please provide a reason for rejection (optional):') || 'No reason provided';
      const res = await fetch(`/api/actions/${actionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, rejectedBy: 'Dr. Triage Demo', reason })
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e) {
      console.error(e);
      alert('Failed to reject action.');
    }
  };

  // Combine patient and otherPatients for the selector
  const allPatients = [patient, ...otherPatients];

  return (
    <div className="min-h-screen bg-background text-neutral-800 dark:text-neutral-200 p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <PatientSelector 
              currentPatientId={patientId}
              patients={allPatients}
              onSelect={setPatientId}
            />
          </div>
        </div>
        
        <PatientHeader patient={patient} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Input Stream & Audit */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <InputStream inputs={inputs} patientId={patientId} />
            
            <div className="border-t border-panel-border pt-6 mt-2">
              <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-500 uppercase tracking-widest mb-3">Audit Trail</h3>
              <div className="max-h-[500px] overflow-y-auto pr-2">
                <AuditTrail events={auditEvents} />
              </div>
            </div>
          </div>
          
          {/* CENTER COLUMN: SBAR, 3D, Facts */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <DynamicAnatomyVisual patient={patient} vitals={patient.vitals} />
            <SbarCard sbar={patient.sbar} />
            
            <div className="mt-4">
              <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-500 uppercase tracking-widest mb-3">Extracted Clinical Facts</h3>
              <ClinicalFacts facts={facts} />
            </div>
          </div>
          
          {/* RIGHT COLUMN: Alerts, Actions, Resources */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div>
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {conflicts.some(c => c.severity === 'critical' || c.severity === 'high') && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  )}
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                AI Clinical Intelligence
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

            <div className="mt-4 border-t border-panel-border pt-6">
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
