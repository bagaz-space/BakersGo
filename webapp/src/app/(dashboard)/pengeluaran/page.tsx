import { TopBar } from '@/components/layout/topbar';
import { PengeluaranTable } from '@/components/modules/pengeluaran-table';

export const metadata = { title: 'Pengeluaran — BakersGo' };

export default function PengeluaranPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Pengeluaran" />
      <div className="flex-1 p-6">
        <PengeluaranTable />
      </div>
    </div>
  );
}
