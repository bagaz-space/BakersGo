'use client';

import { BarChart3 } from 'lucide-react';

export function LaporanView() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ringkasan keuangan, grafik penjualan, dan ekspor laporan.
      </p>

      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center justify-center py-16 gap-4">
        <BarChart3 size={40} className="text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Laporan akan tersedia setelah ada data penjualan dan pengeluaran. Pilih rentang tanggal untuk melihat analitik.
        </p>
      </div>
    </div>
  );
}
