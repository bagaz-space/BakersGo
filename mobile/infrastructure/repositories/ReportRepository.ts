import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { ReportResponse } from '@bakersgo/types';

async function token() {
  return (await getToken()) ?? undefined;
}

export const reportRepository = {
  getSummary: async (from: string, to: string): Promise<ReportResponse> =>
    api.get<ReportResponse>(`/reports/summary?from=${from}&to=${to}`, await token()),
};
