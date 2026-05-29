import { TopBar } from '@/components/layout/topbar';
import { LaporanView } from '@/components/modules/laporan-view';

export const metadata = { title: 'Laporan — BakersGo' };

export default function LaporanPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Laporan & Analitik" description="Ringkasan keuangan bisnis berdasarkan periode yang dipilih. Data diambil dari Penjualan dan Pengeluaran." />
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <LaporanView />
      </div>
    </div>
  );
}
