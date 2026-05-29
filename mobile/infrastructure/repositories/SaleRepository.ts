import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Sale, CreateSaleDto, UpdateSaleDto, SaleListResponse } from '@bakersgo/types';

async function token() {
  return (await getToken()) ?? undefined;
}

export const saleRepository = {
  list: async (from?: string, to?: string): Promise<SaleListResponse> => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString();
    return api.get<SaleListResponse>(`/sales${query ? `?${query}` : ''}`, await token());
  },

  create: async (dto: CreateSaleDto): Promise<Sale> =>
    api.post<Sale>('/sales', dto, await token()),

  update: async (id: string, dto: UpdateSaleDto): Promise<Sale> =>
    api.put<Sale>(`/sales/${id}`, dto, await token()),

  remove: async (id: string): Promise<void> =>
    api.delete<void>(`/sales/${id}`, await token()),
};
