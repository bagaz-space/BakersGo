'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShieldCheck, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useReportSummary } from '@/hooks/useReports';
import { formatCurrency } from '@/lib/utils';

function getMonthRange(year: number, month: number) {
  const from = new Date(year, month, 1).toISOString().split('T')[0];
  const to = new Date(year, month + 1, 0).toISOString().split('T')[0];
  return { from, to };
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatAxisCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return String(value);
}

export function DashboardSummary() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const { from, to } = getMonthRange(year, month);
  const { data, isLoading } = useReportSummary(from, to);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const summary = data?.summary;
  const daily = data?.dailyBreakdown ?? [];

  const stats = [
    {
      label: 'Total Penjualan',
      value: summary?.totalRevenue ?? 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      hint: undefined,
    },
    {
      label: 'Total Pengeluaran',
      value: summary?.totalExpenses ?? 0,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
      hint: undefined,
    },
    {
      label: 'Laba Bersih',
      value: summary?.netProfit ?? 0,
      icon: DollarSign,
      color: 'text-[#A0813A]',
      bg: 'bg-[#A0813A]/10',
      hint: undefined,
    },
    {
      label: 'Saldo Aman',
      value: summary?.safeBalance ?? 0,
      icon: ShieldCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      hint: 'Estimasi saldo kas yang tersedia setelah dikurangi cadangan biaya operasional.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={prevMonth} className="rounded-lg border border-border p-1.5 hover:bg-muted transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          disabled={year === now.getFullYear() && month === now.getMonth()}
          className="rounded-lg border border-border p-1.5 hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, hint }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
            <div className={`rounded-xl p-2.5 ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                {hint && (
                  <div className="relative group">
                    <Info size={11} className="text-muted-foreground cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center leading-relaxed">
                      {hint}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                    </div>
                  </div>
                )}
              </div>
              {isLoading ? (
                <div className="mt-1 h-5 w-24 animate-pulse rounded bg-muted" />
              ) : (
                <p className={`mt-0.5 text-base font-semibold ${value < 0 ? 'text-red-600' : 'text-foreground'}`}>
                  {formatCurrency(value)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {daily.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Penjualan vs Pengeluaran Harian</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={daily} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#8A8A8A' }}
                tickFormatter={(v: string) => v.split('-')[2]}
              />
              <YAxis tick={{ fontSize: 10, fill: '#8A8A8A' }} tickFormatter={formatAxisCurrency} width={40} />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(value as number),
                  (name as string) === 'revenue' ? 'Penjualan' : 'Pengeluaran',
                ]}
                labelFormatter={(label) => `Tgl ${String(label).split('-')[2]}`}
              />
              <Bar dataKey="revenue" fill="#A0813A" radius={[4, 4, 0, 0]} name="revenue" />
              <Bar dataKey="expenses" fill="#DC2626" radius={[4, 4, 0, 0]} name="expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!isLoading && daily.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Belum ada data transaksi di bulan ini. Mulai catat penjualan dan pengeluaran.
        </div>
      )}
    </div>
  );
}
