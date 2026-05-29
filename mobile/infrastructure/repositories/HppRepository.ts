import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { HppEntry, CreateHppDto, UpdateHppDto, HppListResponse } from '@bakersgo/types';

async function token() {
  return (await getToken()) ?? undefined;
}

export const hppRepository = {
  list: (): Promise<HppListResponse> =>
    token().then((t) => api.get<HppListResponse>('/hpp', t)),

  create: async (dto: CreateHppDto): Promise<HppEntry> =>
    api.post<HppEntry>('/hpp', dto, await token()),

  update: async (id: string, dto: UpdateHppDto): Promise<HppEntry> =>
    api.put<HppEntry>(`/hpp/${id}`, dto, await token()),

  remove: async (id: string): Promise<void> =>
    api.delete<void>(`/hpp/${id}`, await token()),
};
