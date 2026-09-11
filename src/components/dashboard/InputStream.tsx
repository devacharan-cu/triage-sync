import { useState, useRef } from 'react';
import { PatientInput, ClinicalFact, ClinicalConflict, AuditEvent, RecommendedAction } from '@/types';
import { FileAudio, FileText, Image as ImageIcon, Video as VideoIcon, CheckCircle2, Loader2, AlertCircle, Upload } from 'lucide-react';
import { inMemoryStore } from '@/lib/firebase/in-memory-store';
import { isFirebaseConfigured } from '@/lib/firebase/config';

export function InputStream({ 
  inputs,
  patientId,
}: { 
  inputs: PatientInput[],
  patientId: string
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      let type: 'text' | 'audio' | 'image' | 'document' | 'video' = 'document';
      if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('text/')) type = 'text';

      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = err => reject(err);
      });

      const base64Data = await base64Promise;

      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          base64Data,
          mimeType: file.type,
          sourceLabel: file.name,
          type
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // If Firebase isn't configured, we rely on in-memory store. 
      // The server's in-memory store doesn't sync with the browser automatically.
      // So we manually inject the returned syncData into the browser's store.
      if (!isFirebaseConfigured && data.syncData) {
        data.syncData.inputs?.forEach((i: PatientInput) => inMemoryStore.setInput(i));
        data.syncData.facts?.forEach((f: ClinicalFact) => inMemoryStore.setFact(f));
        data.syncData.conflicts?.forEach((c: ClinicalConflict) => inMemoryStore.setConflict(c));
        data.syncData.auditEvents?.forEach((a: AuditEvent) => inMemoryStore.setAuditEvent(a));
        data.syncData.actions?.forEach((a: RecommendedAction) => inMemoryStore.setAction(a));
      }
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Analysis incomplete — human review required');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-500 uppercase tracking-widest">Raw Input Stream</h3>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-wider rounded"
        >
          {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          Upload
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept="audio/*,video/*,image/*,text/*,application/pdf"
        />
      </div>

      {error && (
        <div className="p-3 mb-2 bg-red-950/40 border border-red-900/50 rounded-lg flex items-start gap-2 text-red-400">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {inputs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-500 dark:text-neutral-500 border border-panel-border border-dashed rounded-xl">
          <p className="text-sm font-mono mb-2">WAITING_FOR_INPUTS</p>
          <div className="flex gap-3 text-[10px] uppercase font-bold text-neutral-500">
            <span className="flex items-center gap-1"><FileAudio size={12}/> Audio</span>
            <span className="flex items-center gap-1"><VideoIcon size={12}/> Video</span>
            <span className="flex items-center gap-1"><ImageIcon size={12}/> Image</span>
            <span className="flex items-center gap-1"><FileText size={12}/> Document</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {inputs.map(input => {
            const Icon = input.type === 'audio' ? FileAudio : input.type === 'video' ? VideoIcon : input.type === 'image' ? ImageIcon : FileText;
            const statusColor = 
              input.processingStatus === 'completed' ? 'text-emerald-400' : 
              input.processingStatus === 'failed' ? 'text-red-400' : 'text-blue-400';
              
            return (
              <div key={input.id} className="p-3 bg-panel border border-panel-border rounded-xl flex items-center justify-between group hover:border-neutral-300 dark:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-panel-border ${statusColor}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{input.sourceLabel}</p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-500 font-mono mt-0.5">
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
      )}
    </div>
  );
}
