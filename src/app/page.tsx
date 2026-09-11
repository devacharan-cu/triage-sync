import { CommandCenter } from '@/components/dashboard/CommandCenter';

export default function Home() {
  // For the hackathon demo, we default to the synthetic demo patient.
  // In a real implementation, this would be determined by a patient list / routing.
  return (
    <main className="bg-[#050505] min-h-screen">
      <CommandCenter patientId="patient_047" />
    </main>
  );
}
