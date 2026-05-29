import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export interface Sale {
  id: string;
  date: string;
  recipeId?: string;
  recipeName?: string;
  itemName: string;
  qty: number;
  pricePerUnit: number;
  totalRevenue: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleDto {
  date: string;
  recipeId?: string;
  itemName: string;
  qty: number;
  pricePerUnit: number;
}

export interface SaleListResponse {
  data: Sale[];
  total: number;
  totalRevenue: number;
}

export function useSales(from?: string, to?: string) {
  return useQuery<SaleListResponse>({
    queryKey: ['sales', from, to],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const query = params.toString();
      return api.get<SaleListResponse>(`/sales${query ? `?${query}` : ''}`, token ?? undefined);
    },
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation<Sale, Error, CreateSaleDto>({
    mutationFn: async (dto) => {
      const token = await getToken();
      return api.post<Sale>('/sales', dto, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  return useMutation<Sale, Error, { id: string; dto: CreateSaleDto }>({
    mutationFn: async ({ id, dto }) => {
      const token = await getToken();
      return api.put<Sale>(`/sales/${id}`, dto, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken();
      return api.delete<void>(`/sales/${id}`, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
