import { CommandCenter } from '@/components/dashboard/CommandCenter';

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      <CommandCenter initialPatientId="pt_ind_009" />
    </main>
  );
}
