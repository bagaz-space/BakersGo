'use client';

import { Plus } from 'lucide-react';

export function MasterBahanTable() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Daftar bahan baku dan harga per satuan.</p>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
          <Plus size={14} />
          Tambah Bahan
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nama Bahan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Satuan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Harga Kemasan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Volume Kemasan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Harga/Satuan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Stok</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                Belum ada bahan baku. Klik &quot;Tambah Bahan&quot; untuk memulai.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
