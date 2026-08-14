import { KdsClient } from "./KdsClient";

export const metadata = {
  title: 'KDS - COFFEE OS',
  description: 'Kitchen Display System',
};

export default function KdsPage() {
  return (
    <main className="dark bg-slate-950 h-screen w-full">
      <KdsClient />
    </main>
  );
}
