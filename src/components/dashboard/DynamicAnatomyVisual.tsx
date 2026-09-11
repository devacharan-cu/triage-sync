'use client';

import { Patient, PatientVitals } from '@/types';
import { HeartPulse, Brain, Wind, Activity, ShieldAlert, Droplet } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DynamicAnatomyVisual({ patient, vitals }: { patient: Patient, vitals?: PatientVitals }) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-full h-full flex items-center justify-center bg-panel border border-panel-border rounded-xl min-h-[300px]"></div>;

  // Determine primary organ system based on complaint and sbar
  const complaint = (patient.primaryComplaint || '').toLowerCase();
  const assessment = (patient.sbar?.assessment || '').toLowerCase();
  const text = complaint + ' ' + assessment;

  let Icon = Activity;
  let label = 'SYSTEMIC';
  let colorClass = 'text-blue-500';
  let glowClass = 'shadow-blue-500/20';

  if (text.includes('heart') || text.includes('cardiac') || text.includes('stemi') || text.includes('chest pain')) {
    Icon = HeartPulse;
    label = 'CARDIOVASCULAR';
    colorClass = 'text-red-500';
    glowClass = 'shadow-red-500/30';
  } else if (text.includes('brain') || text.includes('stroke') || text.includes('neuro') || text.includes('tbi') || text.includes('head')) {
    Icon = Brain;
    label = 'NEUROLOGICAL';
    colorClass = 'text-purple-500';
    glowClass = 'shadow-purple-500/30';
  } else if (text.includes('lung') || text.includes('respirat') || text.includes('asthma') || text.includes('copd')) {
    Icon = Wind;
    label = 'RESPIRATORY';
    colorClass = 'text-cyan-500';
    glowClass = 'shadow-cyan-500/30';
  } else if (text.includes('trauma') || text.includes('fracture') || text.includes('rta')) {
    Icon = ShieldAlert;
    label = 'MAJOR TRAUMA';
    colorClass = 'text-amber-500';
    glowClass = 'shadow-amber-500/30';
  } else if (text.includes('bleed') || text.includes('hemorrhage') || text.includes('dengue')) {
    Icon = Droplet;
    label = 'HEMATOLOGICAL';
    colorClass = 'text-red-600';
    glowClass = 'shadow-red-600/30';
  }

  // Calculate pulse speed based on heart rate
  const hr = vitals?.heartRate || 80;
  const pulseDuration = hr > 0 ? (60 / hr) : 1;
  const isCritical = hr > 110 || hr < 50 || (vitals?.oxygenSaturation && vitals.oxygenSaturation < 90);

  return (
    <div className="relative w-full h-[320px] bg-panel border border-panel-border rounded-xl flex items-center justify-center overflow-hidden group">
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Label */}
      <div className="absolute top-4 left-4 flex flex-col">
        <span className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase">Target System</span>
        <span className={`text-sm font-mono font-bold ${colorClass}`}>{label}</span>
      </div>

      <div className="absolute top-4 right-4 flex gap-4 text-right">
        {vitals?.heartRate && (
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 tracking-widest">HR</span>
            <span className={`font-mono text-lg font-bold ${vitals.heartRate > 100 ? 'text-red-500 animate-pulse' : 'text-neutral-800 dark:text-neutral-200'}`}>{vitals.heartRate}</span>
          </div>
        )}
        {vitals?.oxygenSaturation && (
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 tracking-widest">SPO2</span>
            <span className={`font-mono text-lg font-bold ${vitals.oxygenSaturation < 94 ? 'text-amber-500' : 'text-neutral-800 dark:text-neutral-200'}`}>{vitals.oxygenSaturation}%</span>
          </div>
        )}
      </div>

      {/* Main Organ Icon */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Glow behind */}
        <div 
          className={`absolute inset-0 rounded-full blur-[60px] opacity-20 ${glowClass}`}
          style={{ animation: `pulse ${pulseDuration * 2}s cubic-bezier(0.4, 0, 0.6, 1) infinite` }}
        ></div>
        
        {/* Icon */}
        <Icon 
          size={140} 
          strokeWidth={1}
          className={`${colorClass} opacity-80 drop-shadow-lg`}
          style={{ animation: `pulse ${pulseDuration}s cubic-bezier(0.4, 0, 0.6, 1) infinite` }}
        />
        
        {/* Scanning line effect */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="w-full h-1 bg-white/20 blur-[2px] absolute left-0 animate-[scan_3s_ease-in-out_infinite]"></div>
        </div>
      </div>
      
      {isCritical && (
        <div className="absolute bottom-4 inset-x-0 text-center">
          <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold tracking-widest uppercase rounded">Critical Indicators Present</span>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
