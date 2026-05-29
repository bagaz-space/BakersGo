import { TopBar } from '@/components/layout/topbar';
import { HppCalculator } from '@/components/modules/hpp-calculator';

export const metadata = { title: 'HPP — BakersGo' };

export default function HppPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="HPP (Harga Pokok Produksi)" description="Hitung Harga Pokok Produksi dari resep yang tersimpan." />
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <HppCalculator />
      </div>
    </div>
  );
}
