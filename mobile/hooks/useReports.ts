import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export interface ReportSummary {
  fromDate: string;
  toDate: string;
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  realBalance: number;
  electricityReserve: number;
  titheAmount: number;
  capitalReserve: number;
  safeBalance: number;
  salesCount: number;
  expensesCount: number;
}

export interface DailyBreakdown {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ReportResponse {
  summary: ReportSummary;
  dailyBreakdown: DailyBreakdown[];
}

export function useReportSummary(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', from, to],
    queryFn: async () => {
      const token = await getToken();
      return api.get<ReportResponse>(`/reports/summary?from=${from}&to=${to}`, token ?? undefined);
    },
    enabled: !!from && !!to,
  });
}
