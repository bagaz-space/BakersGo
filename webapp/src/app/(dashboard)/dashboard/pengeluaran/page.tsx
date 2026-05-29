import { TopBar } from '@/components/layout/topbar';
import { PengeluaranTable } from '@/components/modules/pengeluaran-table';

export const metadata = { title: 'Pengeluaran — BakersGo' };

export default function PengeluaranPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Pengeluaran" description="Catat semua pengeluaran bisnis. Data ini digunakan untuk menghitung laba bersih di laporan." />
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <PengeluaranTable />
      </div>
    </div>
  );
}
