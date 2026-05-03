'use client';

import { Plus } from 'lucide-react';

export function PenjualanTable() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Catat penjualan harian produk bakery Anda.</p>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
          <Plus size={14} />
          Tambah Penjualan
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Produk</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Harga/pcs</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                Belum ada penjualan. Klik &quot;Tambah Penjualan&quot; untuk memulai.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
