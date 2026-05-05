'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { HppEntry, CreateHppDto, UpdateHppDto, HppListResponse } from '@bakersgo/types';

async function getToken(): Promise<string | undefined> {
  const res = await fetch('/api/auth/token');
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.token as string | undefined;
}

export function useHppEntries() {
  return useQuery({
    queryKey: ['hpp'],
    queryFn: async () => {
      const token = await getToken();
      return api.get<HppListResponse>('/hpp', token);
    },
  });
}

export function useSaveHpp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateHppDto) => {
      const token = await getToken();
      return api.post<HppEntry>('/hpp', dto, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hpp'] }),
  });
}

export function useUpdateHpp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateHppDto }) => {
      const token = await getToken();
      return api.put<HppEntry>(`/hpp/${id}`, dto, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hpp'] }),
  });
}

export function useDeleteHpp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return api.delete(`/hpp/${id}`, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hpp'] }),
  });
}
