import { Patient } from '@/types';
import { Activity, Heart, Wind } from 'lucide-react';

export function PatientHeader({ patient }: { patient: Patient }) {
  const isCritical = patient.severity === 'CRITICAL';
  const severityColor = isCritical ? 'text-red-400 bg-red-400/10 border-red-400/20' : 
                        patient.severity === 'WARNING' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 
                        'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-panel-border">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{patient.name || 'Unknown Patient'}</h1>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${severityColor}`}>
            {patient.severity || 'UNKNOWN'}
          </span>
          {patient.id === 'patient_047' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              SYNTHETIC DEMO DATA
            </span>
          )}
        </div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-3 font-mono text-xs">
          <span>ID: {patient.id}</span>
          <span>•</span>
          <span>{patient.age}y {patient.gender}</span>
          <span>•</span>
          <span>{patient.triageCategory}</span>
        </div>
      </div>
      
      {patient.vitals && (
        <div className="flex gap-4 p-3 bg-panel border border-panel-border rounded-xl">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 dark:text-neutral-500 uppercase flex items-center gap-1"><Heart size={10} /> HR</span>
            <span className="text-sm font-mono text-neutral-800 dark:text-neutral-200">{patient.vitals.heartRate || '--'} bpm</span>
          </div>
          <div className="w-px bg-panel-border"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 dark:text-neutral-500 uppercase flex items-center gap-1"><Activity size={10} /> BP</span>
            <span className="text-sm font-mono text-neutral-800 dark:text-neutral-200">{patient.vitals.bloodPressure || '--'}</span>
          </div>
          <div className="w-px bg-panel-border"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 dark:text-neutral-500 uppercase flex items-center gap-1"><Wind size={10} /> SpO2</span>
            <span className="text-sm font-mono text-neutral-800 dark:text-neutral-200">{patient.vitals.oxygenSaturation || '--'}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
