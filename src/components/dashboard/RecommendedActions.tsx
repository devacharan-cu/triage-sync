import { RecommendedAction } from '@/types';
import { Check, X } from 'lucide-react';

export function RecommendedActions({ 
  actions, 
  onApprove, 
  onReject 
}: { 
  actions: RecommendedAction[],
  onApprove: (actionId: string) => void,
  onReject: (actionId: string) => void
}) {
  if (actions.length === 0) {
    return (
      <div className="p-4 border border-panel-border rounded-xl bg-neutral-100 dark:bg-neutral-900/50 flex flex-col items-center justify-center">
        <p className="text-neutral-500 dark:text-neutral-500 font-mono text-sm">No recommendations generated yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
        </span>
        AI recommendation — clinician approval required
      </div>
      {actions.map(action => (
        <div key={action.id} className="p-3 border border-panel-border rounded-xl bg-panel flex flex-col gap-2">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase
                  ${action.priority === 'critical' || action.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}
                `}>
                  {action.priority} priority
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-500 font-mono">ID: {action.id.split('_').pop()}</span>
              </div>
              <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-1">{action.action}</h4>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              {action.status === 'pending' ? (
                <>
                  <button 
                    onClick={() => onApprove(action.id)}
                    className="p-1.5 rounded bg-neutral-800 text-emerald-400 hover:bg-emerald-900/30 transition-colors" 
                    title="Approve"
                  >
                    <Check size={14} />
                  </button>
                  <button 
                    onClick={() => onReject(action.id)}
                    className="p-1.5 rounded bg-neutral-800 text-red-400 hover:bg-red-900/30 transition-colors" 
                    title="Reject"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : action.status === 'approved' ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1 border border-emerald-900/50 bg-emerald-950/20 px-2 py-1 rounded">
                  <Check size={12} /> Approved
                </span>
              ) : (
                <span className="text-xs text-neutral-500 dark:text-neutral-500 flex items-center gap-1 border border-panel-border bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">
                  <X size={12} /> Rejected
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 border-t border-panel-border/50 pt-2 mt-1">
            {action.rationale}
          </p>
        </div>
      ))}
    </div>
  );
}
