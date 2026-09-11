import { HospitalResource } from '@/types';
import { Package } from 'lucide-react';

export function HospitalResources({ resources }: { resources: HospitalResource[] }) {
  if (resources.length === 0) {
    return (
      <div className="p-4 border border-neutral-800 rounded-xl bg-neutral-900/50 flex flex-col items-center justify-center h-full">
        <p className="text-neutral-500 font-mono text-sm">NO_RESOURCES_FOUND</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {resources.map(res => {
        const usage = (res.quantity - res.available) / res.quantity;
        const color = usage > 0.8 ? 'text-red-400 bg-red-400/10' : usage > 0.5 ? 'text-amber-400 bg-amber-400/10' : 'text-emerald-400 bg-emerald-400/10';
        const progressColor = usage > 0.8 ? 'bg-red-500' : usage > 0.5 ? 'bg-amber-500' : 'bg-emerald-500';

        return (
          <div key={res.id} className="p-3 border border-neutral-800 rounded-xl bg-[#111] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${color}`}>
                <Package size={14} />
              </div>
              <h4 className="text-xs font-bold text-neutral-300">{res.name}</h4>
            </div>
            <div className="flex justify-between items-end mt-1">
              <span className="text-xl font-mono text-neutral-100">{res.available}</span>
              <span className="text-[10px] text-neutral-500 uppercase">of {res.quantity}</span>
            </div>
            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden mt-1">
              <div className={`h-full ${progressColor}`} style={{ width: `${usage * 100}%` }}></div>
            </div>
            <p className="text-[9px] text-neutral-500 mt-1 truncate">{res.location}</p>
          </div>
        );
      })}
    </div>
  );
}
