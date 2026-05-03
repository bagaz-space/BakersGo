import { TopBar } from '@/components/layout/topbar';
import { MasterResepTable } from '@/components/modules/master-resep-table';

export const metadata = { title: 'Master Resep — BakersGo' };

export default function MasterResepPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Master Resep" />
      <div className="flex-1 p-6">
        <MasterResepTable />
      </div>
    </div>
  );
}
