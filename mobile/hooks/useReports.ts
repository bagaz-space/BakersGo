import { useQuery } from '@tanstack/react-query';
import { reportRepository } from '@/infrastructure/repositories/ReportRepository';
import type { ReportResponse } from '@bakersgo/types';

export function useReportSummary(from: string, to: string) {
  return useQuery<ReportResponse>({
    queryKey: ['reports', from, to],
    queryFn: () => reportRepository.getSummary(from, to),
    enabled: !!from && !!to,
  });
}
