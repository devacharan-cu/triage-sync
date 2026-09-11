import { ClinicalFact, ClinicalConflict, RecommendedAction, PatientInput } from '@/types';
import { X, Search } from 'lucide-react';

type EvidenceProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  item: ClinicalFact | ClinicalConflict | RecommendedAction | null;
  inputs: PatientInput[];
  facts: ClinicalFact[]; // all facts for context
};

export function EvidenceViewer({ isOpen, onClose, title, item, inputs, facts }: EvidenceProps) {
  if (!isOpen || !item) return null;

  // Determine what type of item it is to display its evidence
  let relatedFactIds: string[] = [];
  if ('conflictingFactIds' in item) {
    relatedFactIds = item.conflictingFactIds;
  } else if ('sourceFactIds' in item) {
    relatedFactIds = item.sourceFactIds || [];
  } else if ('sourceInputIds' in item) {
    // It's a fact itself
    relatedFactIds = [item.id];
  }

  const relatedFacts = facts.filter(f => relatedFactIds.includes(f.id));
  
  // Find source inputs
  const allSourceInputIds = Array.from(new Set(relatedFacts.flatMap(f => f.sourceInputIds)));
  const relatedInputs = inputs.filter(i => allSourceInputIds.includes(i.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-neutral-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-200 flex items-center gap-2">
            <Search size={18} className="text-blue-500" /> 
            {title} - Evidence Review
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex flex-col gap-6">
          {/* Item details */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Subject for Review</h3>
            {'description' in item ? (
              <p className="text-sm text-neutral-200">{item.description}</p>
            ) : 'rationale' in item ? (
              <p className="text-sm text-neutral-200">{item.action}: {item.rationale}</p>
            ) : (
              <p className="text-sm text-neutral-200">{item.value}</p>
            )}
          </div>

          {/* Related Facts */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Supporting Extracted Facts</h3>
            {relatedFacts.length > 0 ? (
              <div className="flex flex-col gap-2">
                {relatedFacts.map(fact => (
                  <div key={fact.id} className="p-3 border border-neutral-800 rounded-lg bg-neutral-950 flex justify-between items-center gap-4">
                    <div>
                      <span className="text-[10px] text-blue-400 font-mono uppercase px-1.5 py-0.5 bg-blue-900/20 border border-blue-900/50 rounded mr-2">
                        {fact.category}
                      </span>
                      <span className="text-sm text-neutral-200">{fact.value}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] font-mono text-neutral-500">Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${fact.confidence > 80 ? 'bg-emerald-500' : fact.confidence > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${fact.confidence}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono w-6 text-right">{fact.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 font-mono italic">No associated facts found.</p>
            )}
          </div>

          {/* Source Inputs */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Source Documents & Inputs</h3>
            {relatedInputs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedInputs.map(input => (
                  <div key={input.id} className="p-3 border border-neutral-800 rounded-lg bg-neutral-950 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-neutral-300">{input.sourceLabel}</span>
                      <span className="text-[10px] text-neutral-500 font-mono bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                        {input.type}
                      </span>
                    </div>
                    {input.extractedText && (
                      <div className="mt-2 text-xs text-neutral-400 border-t border-neutral-800/50 pt-2 line-clamp-3">
                        &quot;{input.extractedText}&quot;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 font-mono italic">No associated source inputs found.</p>
            )}
          </div>
          
        </div>
        
        <div className="p-4 border-t border-neutral-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg transition-colors">
            Close Evidence Review
          </button>
        </div>
      </div>
    </div>
  );
}
