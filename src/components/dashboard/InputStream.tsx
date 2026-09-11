import { PatientInput } from '@/types';
import { FileAudio, FileText, Image as ImageIcon, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export function InputStream({ inputs }: { inputs: PatientInput[] }) {
  if (inputs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-neutral-500 border border-neutral-800 border-dashed rounded-xl">
        <p className="text-sm font-mono">WAITING_FOR_INPUTS</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Raw Input Stream</h3>
      <div className="flex flex-col gap-2">
        {inputs.map(input => {
          const Icon = input.type === 'audio' ? FileAudio : input.type === 'image' ? ImageIcon : FileText;
          const statusColor = 
            input.processingStatus === 'completed' ? 'text-emerald-400' : 
            input.processingStatus === 'failed' ? 'text-red-400' : 'text-blue-400';
            
          return (
            <div key={input.id} className="p-3 bg-[#111] border border-neutral-800 rounded-xl flex items-center justify-between group hover:border-neutral-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-neutral-900 border border-neutral-800 ${statusColor}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-300">{input.sourceLabel}</p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    {new Date(input.uploadedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div>
                {input.processingStatus === 'completed' ? (
                  <CheckCircle2 size={16} className="text-emerald-500/50" />
                ) : input.processingStatus === 'failed' ? (
                  <AlertCircle size={16} className="text-red-500/50" />
                ) : (
                  <Loader2 size={16} className="text-blue-500/50 animate-spin" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
