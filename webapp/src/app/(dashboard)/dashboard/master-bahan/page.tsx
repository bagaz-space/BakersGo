import { TopBar } from '@/components/layout/topbar';
import { MasterBahanTable } from '@/components/modules/master-bahan-table';

export const metadata = { title: 'Master Bahan — BakersGo' };

export default function MasterBahanPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Master Bahan" />
      <div className="flex-1 p-6">
        <MasterBahanTable />
      </div>
    </div>
  );
}
