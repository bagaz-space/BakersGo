import { TopBar } from '@/components/layout/topbar';
import { SettingsForm } from '@/components/modules/settings-form';

export const metadata = { title: 'Profil Saya — BakersGo' };

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Profil Saya" />
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <SettingsForm />
      </div>
    </div>
  );
}
