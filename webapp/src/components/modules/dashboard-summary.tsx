'use client';

import { TrendingUp, TrendingDown, DollarSign, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const STAT_CARDS = [
  {
    label: 'Total Penjualan',
    value: 0,
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    label: 'Total Pengeluaran',
    value: 0,
    icon: TrendingDown,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    label: 'Laba Bersih',
    value: 0,
    icon: DollarSign,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    label: 'Saldo Aman',
    value: 0,
    icon: ShieldCheck,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
];

export function DashboardSummary() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4"
          >
            <div className={`rounded-xl p-2.5 ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-xl font-semibold text-foreground">
                {formatCurrency(value)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">
          Ringkasan Bulan Ini
        </h2>
        <p className="text-sm text-muted-foreground">
          Data akan muncul setelah Anda menambahkan transaksi penjualan dan pengeluaran.
        </p>
      </div>
    </div>
  );
}
