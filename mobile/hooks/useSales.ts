import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleRepository } from '@/infrastructure/repositories/SaleRepository';
import type { Sale, CreateSaleDto, UpdateSaleDto, SaleListResponse } from '@bakersgo/types';

export function useSales(from?: string, to?: string) {
  return useQuery<SaleListResponse>({
    queryKey: ['sales', from, to],
    queryFn: () => saleRepository.list(from, to),
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation<Sale, Error, CreateSaleDto>({
    mutationFn: (dto) => saleRepository.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  return useMutation<Sale, Error, { id: string; dto: UpdateSaleDto }>({
    mutationFn: ({ id, dto }) => saleRepository.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => saleRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
