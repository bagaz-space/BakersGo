'use client';

import { useState, useMemo } from 'react';
import { Download, TrendingUp, TrendingDown, DollarSign, ShieldCheck, Info } from 'lucide-react';
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
import { useExpenses } from '@/hooks/useExpenses';
import { useSales } from '@/hooks/useSales';
import { formatCurrency, formatDate } from '@/lib/utils';

function today() { return new Date().toISOString().split('T')[0]; }
function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}
function threeMonthsAgo() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
}
function yearStart() {
  return `${new Date().getFullYear()}-01-01`;
}

function formatAxisCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return String(value);
}

export function LaporanView() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());

  const { data: reportData, isLoading: reportLoading } = useReportSummary(from, to);
  const { data: expenseData } = useExpenses(from, to);
  const { data: saleData } = useSales(from, to);

  const summary = reportData?.summary;
  const daily = reportData?.dailyBreakdown ?? [];

  const combined = useMemo(() => {
    const expenses = (expenseData?.data ?? []).map((e) => ({
      id: e.id,
      date: e.date,
      type: 'expense' as const,
      label: e.description,
      badge: e.category,
      amount: -e.amount,
    }));
    const sales = (saleData?.data ?? []).map((s) => ({
      id: s.id,
      date: s.date,
      type: 'sale' as const,
      label: s.itemName,
      badge: `${s.qty} pcs`,
      amount: s.totalRevenue,
    }));
    return [...expenses, ...sales].sort((a, b) => b.date.localeCompare(a.date));
  }, [expenseData, saleData]);

  const stats = [
    { label: 'Total Penjualan', value: summary?.totalRevenue ?? 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', hint: undefined },
    { label: 'Total Pengeluaran', value: summary?.totalExpenses ?? 0, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', hint: undefined },
    { label: 'Laba Bersih', value: summary?.netProfit ?? 0, icon: DollarSign, color: 'text-[#A0813A]', bg: 'bg-[#A0813A]/10', hint: undefined },
    { label: 'Saldo Aman', value: summary?.safeBalance ?? 0, icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', hint: 'Estimasi saldo kas yang aman: Laba Bersih dikurangi cadangan operasional.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors"
            />
            <span className="text-xs text-muted-foreground">—</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setFrom(monthStart()); setTo(today()); }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors">
              Bulan Ini
            </button>
            <button onClick={() => { setFrom(threeMonthsAgo()); setTo(today()); }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors">
              3 Bulan
            </button>
            <button onClick={() => { setFrom(yearStart()); setTo(today()); }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors">
              Tahun Ini
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => alert('Export CSV — belum diimplementasikan')}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs hover:bg-muted transition-colors"
          >
            <Download size={13} />
            CSV
          </button>
          <button
            onClick={() => alert('Export PDF — belum diimplementasikan')}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs hover:bg-muted transition-colors"
          >
            <Download size={13} />
            PDF
          </button>
        </div>
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
              {reportLoading ? (
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
          <h3 className="text-sm font-medium text-foreground mb-4">Penjualan vs Pengeluaran</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={daily} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#8A8A8A' }}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 10, fill: '#8A8A8A' }} tickFormatter={formatAxisCurrency} width={40} />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(value as number),
                  (name as string) === 'revenue' ? 'Penjualan' : 'Pengeluaran',
                ]}
              />
              <Bar dataKey="revenue" fill="#A0813A" radius={[4, 4, 0, 0]} name="revenue" />
              <Bar dataKey="expenses" fill="#DC2626" radius={[4, 4, 0, 0]} name="expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-medium text-foreground">Semua Transaksi</h3>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[420px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tipe</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Keterangan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {combined.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Belum ada transaksi di periode ini.
                </td>
              </tr>
            ) : (
              combined.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(item.date)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.type === 'sale'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {item.type === 'sale' ? 'Penjualan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {item.label}
                    <span className="ml-2 text-xs text-muted-foreground">{item.badge}</span>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${item.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {item.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(item.amount))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
