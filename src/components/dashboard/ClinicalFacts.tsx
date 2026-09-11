import { ClinicalFact } from '@/types';

export function ClinicalFacts({ facts }: { facts: ClinicalFact[] }) {
  if (facts.length === 0) {
    return null;
  }

  // Group facts by category
  const grouped = facts.reduce((acc, fact) => {
    if (!acc[fact.category]) acc[fact.category] = [];
    acc[fact.category].push(fact);
    return acc;
  }, {} as Record<string, ClinicalFact[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="border border-panel-border rounded-xl overflow-hidden bg-panel">
          <div className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-900 border-b border-panel-border flex justify-between items-center">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              {category.replace('_', ' ')}
            </h4>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {items.map(fact => (
              <div key={fact.id} className="flex justify-between items-start gap-3 border-b border-panel-border/50 pb-2 last:border-0 last:pb-0">
                <div className="flex-1">
                  <span className="text-sm text-neutral-800 dark:text-neutral-200 leading-tight block mb-1">{fact.value}</span>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${fact.verificationStatus === 'VERIFIED' ? 'text-emerald-400 border-emerald-900/50 bg-emerald-950/20' : 'text-amber-400 border-amber-900/50 bg-amber-950/20'}`}>
                    {fact.verificationStatus}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-500 uppercase">AI CONFIDENCE</span>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${fact.confidence > 80 ? 'bg-emerald-500' : fact.confidence > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${fact.confidence}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-neutral-500 dark:text-neutral-500 font-mono w-5">{fact.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
