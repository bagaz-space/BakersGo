'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Sale,
  CreateSaleDto,
  UpdateSaleDto,
  SaleListResponse,
} from '@bakersgo/types';

async function getToken(): Promise<string | undefined> {
  const res = await fetch('/api/auth/token');
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.token as string | undefined;
}

export function useSales(from?: string, to?: string) {
  return useQuery({
    queryKey: ['sales', from, to],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      return api.get<SaleListResponse>(`/sales${qs ? `?${qs}` : ''}`, token);
    },
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateSaleDto) => {
      const token = await getToken();
      return api.post<Sale>('/sales', dto, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateSaleDto }) => {
      const token = await getToken();
      return api.put<Sale>(`/sales/${id}`, dto, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return api.delete(`/sales/${id}`, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
