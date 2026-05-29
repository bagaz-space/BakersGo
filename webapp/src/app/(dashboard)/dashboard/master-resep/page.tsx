import { TopBar } from '@/components/layout/topbar';
import { MasterResepTable } from '@/components/modules/master-resep-table';

export const metadata = { title: 'Master Resep — BakersGo' };

export default function MasterResepPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Master Resep" description="Buat resep standar beserta komposisi bahan. Biaya dasar dihitung otomatis dan digunakan di kalkulator HPP." />
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <MasterResepTable />
      </div>
    </div>
  );
}
