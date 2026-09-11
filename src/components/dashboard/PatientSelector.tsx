import { Patient } from '@/types';
import { Users } from 'lucide-react';

export function PatientSelector({ 
  currentPatientId, 
  patients, 
  onSelect 
}: { 
  currentPatientId: string, 
  patients: Patient[], 
  onSelect: (id: string) => void 
}) {
  return (
    <div className="flex items-center gap-3">
      <Users size={16} className="text-neutral-500" />
      <select 
        value={currentPatientId}
        onChange={(e) => onSelect(e.target.value)}
        className="bg-[#111] border border-neutral-800 text-neutral-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 font-mono"
      >
        <option value="patient_047">Patient #047 (Synthetic Demo)</option>
        {patients.filter(p => p.id !== 'patient_047').map(p => (
          <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
        ))}
      </select>
    </div>
  );
}
