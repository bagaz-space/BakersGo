import { TopBar } from '@/components/layout/topbar';
import { MasterBahanTable } from '@/components/modules/master-bahan-table';

export const metadata = { title: 'Master Bahan — BakersGo' };

export default function MasterBahanPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Master Bahan" description="Kelola daftar bahan baku beserta harga dan satuan. Harga per satuan dihitung otomatis dari harga dan volume kemasan." />
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <MasterBahanTable />
      </div>
    </div>
  );
}
