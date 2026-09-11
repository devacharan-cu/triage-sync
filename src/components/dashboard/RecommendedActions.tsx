import { RecommendedAction } from '@/types';
import { Check, X } from 'lucide-react';

export function RecommendedActions({ actions }: { actions: RecommendedAction[] }) {
  if (actions.length === 0) {
    return (
      <div className="p-4 border border-neutral-800 rounded-xl bg-neutral-900/50 flex flex-col items-center justify-center">
        <p className="text-neutral-500 font-mono text-sm">NO_RECOMMENDED_ACTIONS</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {actions.map(action => (
        <div key={action.id} className="p-3 border border-neutral-800 rounded-xl bg-[#111] flex flex-col gap-2">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase
                  ${action.priority === 'critical' || action.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}
                `}>
                  {action.priority} priority
                </span>
                <span className="text-xs text-neutral-500 font-mono">ID: {action.id.slice(0, 8)}</span>
              </div>
              <h4 className="text-sm font-semibold text-neutral-200 mt-1">{action.action}</h4>
            </div>
            
            <div className="flex items-center gap-1">
              {action.status === 'pending' ? (
                <>
                  <button className="p-1.5 rounded bg-neutral-800 text-emerald-400 hover:bg-emerald-900/30 transition-colors" title="Approve">
                    <Check size={14} />
                  </button>
                  <button className="p-1.5 rounded bg-neutral-800 text-red-400 hover:bg-red-900/30 transition-colors" title="Reject">
                    <X size={14} />
                  </button>
                </>
              ) : action.status === 'approved' ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1 border border-emerald-900/50 bg-emerald-950/20 px-2 py-1 rounded">
                  <Check size={12} /> Approved
                </span>
              ) : (
                <span className="text-xs text-neutral-500 flex items-center gap-1 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded">
                  <X size={12} /> Rejected
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-neutral-400 border-t border-neutral-800/50 pt-2 mt-1">
            {action.rationale}
          </p>
        </div>
      ))}
    </div>
  );
}
