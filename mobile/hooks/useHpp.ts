import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type {
  HppEntry,
  CreateHppDto,
  UpdateHppDto,
  HppListResponse,
} from '@bakersgo/types';

export function useHppEntries() {
  return useQuery<HppListResponse>({
    queryKey: ['hpp'],
    queryFn: async () => {
      const token = await getToken();
      return api.get<HppListResponse>('/hpp', token ?? undefined);
    },
  });
}

export function useSaveHpp() {
  const queryClient = useQueryClient();
  return useMutation<HppEntry, Error, CreateHppDto>({
    mutationFn: async (dto) => {
      const token = await getToken();
      return api.post<HppEntry>('/hpp', dto, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hpp'] });
    },
  });
}

export function useUpdateHpp() {
  const queryClient = useQueryClient();
  return useMutation<HppEntry, Error, { id: string; dto: UpdateHppDto }>({
    mutationFn: async ({ id, dto }) => {
      const token = await getToken();
      return api.put<HppEntry>(`/hpp/${id}`, dto, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hpp'] });
    },
  });
}

export function useDeleteHpp() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken();
      return api.delete<void>(`/hpp/${id}`, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hpp'] });
    },
  });
}
