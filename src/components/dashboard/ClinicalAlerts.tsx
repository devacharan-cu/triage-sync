import { ClinicalConflict } from '@/types';
import { AlertTriangle, Info, AlertCircle, FileSearch } from 'lucide-react';

export function ClinicalAlerts({ 
  conflicts, 
  onReview 
}: { 
  conflicts: ClinicalConflict[],
  onReview: (conflict: ClinicalConflict) => void
}) {
  if (conflicts.length === 0) {
    return (
      <div className="p-4 border border-panel-border rounded-xl bg-neutral-100 dark:bg-neutral-900/50 flex flex-col items-center justify-center h-full">
        <Info className="text-neutral-600 mb-2" size={24} />
        <p className="text-neutral-500 dark:text-neutral-500 font-mono text-sm uppercase">AWAITING CLINICAL DATA</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {conflicts.map(conflict => {
        let Icon = AlertTriangle;
        let colorClasses = 'bg-neutral-100 dark:bg-neutral-900/50 border-panel-border text-neutral-600 dark:text-neutral-400';
        let buttonClasses = 'bg-panel border-panel-border text-neutral-600 dark:text-neutral-400 hover:bg-neutral-800';
        let typeLabel = 'ALERT';

        if (conflict.type === 'conflict') {
          Icon = AlertTriangle;
          colorClasses = conflict.severity === 'critical' ? 'bg-red-950/20 border-red-900/50 text-red-400' : 'bg-amber-950/20 border-amber-900/50 text-amber-400';
          buttonClasses = conflict.severity === 'critical' ? 'border-red-900/50 text-red-400 hover:bg-red-950/40' : 'border-amber-900/50 text-amber-400 hover:bg-amber-950/40';
          typeLabel = 'CONTRADICTION';
        } else if (conflict.type === 'missed_signal') {
          Icon = AlertCircle;
          colorClasses = 'bg-amber-950/20 border-amber-900/50 text-amber-400';
          buttonClasses = 'border-amber-900/50 text-amber-400 hover:bg-amber-950/40';
          typeLabel = 'MISSED SIGNAL';
        } else if (conflict.type === 'confirmation') {
          Icon = Info;
          colorClasses = 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400';
          buttonClasses = 'border-emerald-900/50 text-emerald-400 hover:bg-emerald-950/40';
          typeLabel = 'CONFIRMATION';
        } else if (conflict.type === 'addition') {
          Icon = Info;
          colorClasses = 'bg-blue-950/20 border-blue-900/50 text-blue-400';
          buttonClasses = 'border-blue-900/50 text-blue-400 hover:bg-blue-950/40';
          typeLabel = 'NEW ADDITION';
        } else if (conflict.type === 'interpretation_change') {
          Icon = AlertCircle;
          colorClasses = 'bg-purple-950/20 border-purple-900/50 text-purple-400';
          buttonClasses = 'border-purple-900/50 text-purple-400 hover:bg-purple-950/40';
          typeLabel = 'CONTEXT CHANGE';
        }

        return (
          <div 
            key={conflict.id}
            className={`p-3 rounded-xl border flex gap-3 ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]}`}
          >
            <div className={`mt-0.5 ${colorClasses.split(' ')[2]}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${colorClasses.split(' ')[1]} ${colorClasses.split(' ')[2]}`}>
                  {typeLabel}
                </span>
                <h4 className={`text-sm font-bold uppercase tracking-wide ${colorClasses.split(' ')[2]}`}>
                  {conflict.topic}
                </h4>
              </div>
              <p className="text-sm mt-1 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {conflict.description}
              </p>
              
              {conflict.requiresHumanReview && conflict.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={() => onReview(conflict)}
                    className={`text-xs px-3 py-1.5 rounded bg-panel border flex items-center gap-1.5 font-bold tracking-wider ${buttonClasses}`}
                  >
                    <FileSearch size={12} />
                    REVIEW EVIDENCE
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
