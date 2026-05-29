import { TopBar } from '@/components/layout/topbar';
import { PenjualanTable } from '@/components/modules/penjualan-table';

export const metadata = { title: 'Penjualan — BakersGo' };

export default function PenjualanPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Penjualan" description="Catat semua penjualan bisnis. Data ini digunakan untuk menghitung laba bersih di laporan."/>
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <PenjualanTable />
      </div>
    </div>
  );
}
