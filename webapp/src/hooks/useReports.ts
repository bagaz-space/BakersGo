'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ReportResponse } from '@bakersgo/types';

async function getToken(): Promise<string | undefined> {
  const res = await fetch('/api/auth/token');
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.token as string | undefined;
}

export function useReportSummary(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', from, to],
    queryFn: async () => {
      const token = await getToken();
      return api.get<ReportResponse>(`/reports/summary?from=${from}&to=${to}`, token);
    },
    enabled: !!from && !!to,
  });
}
