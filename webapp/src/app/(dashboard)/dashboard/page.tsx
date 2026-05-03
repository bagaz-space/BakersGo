import { TopBar } from '@/components/layout/topbar';
import { DashboardSummary } from '@/components/modules/dashboard-summary';

export const metadata = { title: 'Beranda — BakersGo' };

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Beranda" />
      <div className="flex-1 p-6">
        <DashboardSummary />
      </div>
    </div>
  );
}
