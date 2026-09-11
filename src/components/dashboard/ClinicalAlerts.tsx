import { ClinicalConflict } from '@/types';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

export function ClinicalAlerts({ conflicts }: { conflicts: ClinicalConflict[] }) {
  if (conflicts.length === 0) {
    return (
      <div className="p-4 border border-neutral-800 rounded-xl bg-neutral-900/50 flex flex-col items-center justify-center h-full">
        <Info className="text-neutral-600 mb-2" size={24} />
        <p className="text-neutral-500 font-mono text-sm">NO_CLINICAL_ALERTS</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {conflicts.map(conflict => {
        const isCritical = conflict.severity === 'critical';
        const isMissedSignal = conflict.type === 'missed_signal';
        const Icon = isMissedSignal ? AlertCircle : AlertTriangle;
        
        return (
          <div 
            key={conflict.id}
            className={`p-3 rounded-xl border flex gap-3
              ${isCritical 
                ? 'bg-red-950/20 border-red-900/50' 
                : 'bg-amber-950/20 border-amber-900/50'
              }`}
          >
            <div className={`mt-0.5 ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-bold uppercase tracking-wide
                ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                {conflict.topic}
              </h4>
              <p className="text-sm mt-1 text-neutral-300 leading-relaxed">
                {conflict.description}
              </p>
              
              {conflict.requiresHumanReview && conflict.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <button className={`text-xs px-3 py-1.5 rounded bg-[#111] border hover:bg-neutral-800
                    ${isCritical ? 'border-red-900/50 text-red-400' : 'border-amber-900/50 text-amber-400'}`}>
                    REVIEW REQUIRED
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
