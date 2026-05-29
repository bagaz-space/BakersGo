import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hppRepository } from '@/infrastructure/repositories/HppRepository';
import type { HppEntry, CreateHppDto, UpdateHppDto, HppListResponse } from '@bakersgo/types';

export function useHppEntries() {
  return useQuery<HppListResponse>({
    queryKey: ['hpp'],
    queryFn: () => hppRepository.list(),
  });
}

export function useSaveHpp() {
  const queryClient = useQueryClient();
  return useMutation<HppEntry, Error, CreateHppDto>({
    mutationFn: (dto) => hppRepository.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hpp'] }),
  });
}

export function useUpdateHpp() {
  const queryClient = useQueryClient();
  return useMutation<HppEntry, Error, { id: string; dto: UpdateHppDto }>({
    mutationFn: ({ id, dto }) => hppRepository.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hpp'] }),
  });
}

export function useDeleteHpp() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => hppRepository.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hpp'] }),
  });
}
