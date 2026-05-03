import { TopBar } from '@/components/layout/topbar';
import { PenjualanTable } from '@/components/modules/penjualan-table';

export const metadata = { title: 'Penjualan — BakersGo' };

export default function PenjualanPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Penjualan" />
      <div className="flex-1 p-6">
        <PenjualanTable />
      </div>
    </div>
  );
}
