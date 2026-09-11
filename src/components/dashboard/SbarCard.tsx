import { PatientSBAR } from '@/types';

export function SbarCard({ sbar }: { sbar?: PatientSBAR }) {
  if (!sbar) {
    return (
      <div className="p-4 border border-neutral-800 rounded-xl bg-neutral-900/50 flex items-center justify-center h-48">
        <p className="text-neutral-500 font-mono text-sm">NO_SBAR_DATA</p>
      </div>
    );
  }

  return (
    <div className="border border-neutral-800 rounded-xl bg-[#111] overflow-hidden flex flex-col">
      <div className="px-4 py-2 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center">
        <h3 className="font-mono text-sm tracking-wider text-neutral-300">SBAR_SUMMARY</h3>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Situation</span>
          <p className="text-sm mt-1 text-neutral-200">{sbar.situation}</p>
        </div>
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Background</span>
          <p className="text-sm mt-1 text-neutral-200">{sbar.background}</p>
        </div>
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Assessment</span>
          <p className="text-sm mt-1 text-neutral-200">{sbar.assessment}</p>
        </div>
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Recommendation</span>
          <p className="text-sm mt-1 text-neutral-200">{sbar.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
