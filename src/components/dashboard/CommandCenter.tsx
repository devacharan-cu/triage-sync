'use client';

import { usePatientData } from '@/hooks/usePatientData';
import { PatientHeader } from './PatientHeader';
import { InputStream } from './InputStream';
import { SbarCard } from './SbarCard';
import { Vitals3DModel } from '../3d/Vitals3DModel';
import { ClinicalAlerts } from './ClinicalAlerts';
import { RecommendedActions } from './RecommendedActions';
import { ClinicalFacts } from './ClinicalFacts';
import { Loader2 } from 'lucide-react';

export function CommandCenter({ patientId }: { patientId: string }) {
  const { patient, inputs, facts, conflicts, actions, loading } = usePatientData(patientId);

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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto">
        <PatientHeader patient={patient} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Input Stream */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <InputStream inputs={inputs} />
            
            <div className="border-t border-neutral-800 pt-6 mt-2">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">System Status</h3>
              <div className="flex flex-col gap-2 font-mono text-[10px] text-neutral-500">
                <div className="flex justify-between">
                  <span>API_LATENCY</span>
                  <span className="text-emerald-500">42ms</span>
                </div>
                <div className="flex justify-between">
                  <span>GEMINI_PIPELINE</span>
                  <span className="text-emerald-500">ONLINE</span>
                </div>
                <div className="flex justify-between">
                  <span>DATA_LAYER</span>
                  <span className="text-emerald-500">SYNCED</span>
                </div>
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
          
          {/* RIGHT COLUMN: Alerts, Actions */}
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
              <ClinicalAlerts conflicts={conflicts} />
            </div>
            
            <div className="mt-4">
              <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">Recommended Actions</h3>
              <RecommendedActions actions={actions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
