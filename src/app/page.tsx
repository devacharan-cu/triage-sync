import { CommandCenter } from '@/components/dashboard/CommandCenter';

export default function Home() {
  return (
    <main className="bg-[#050505] min-h-screen">
      <CommandCenter initialPatientId="patient_047" />
    </main>
  );
}
