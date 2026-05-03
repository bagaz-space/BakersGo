import { TopBar } from '@/components/layout/topbar';
import { LaporanView } from '@/components/modules/laporan-view';

export const metadata = { title: 'Laporan — BakersGo' };

export default function LaporanPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Laporan & Analitik" />
      <div className="flex-1 p-6">
        <LaporanView />
      </div>
    </div>
  );
}
