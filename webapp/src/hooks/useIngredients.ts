'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Ingredient, CreateIngredientDto, UpdateIngredientDto, IngredientListResponse } from '@bakersgo/types';

async function getToken(): Promise<string | undefined> {
  const res = await fetch('/api/auth/token');
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.token as string | undefined;
}

export function useIngredients() {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const token = await getToken();
      return api.get<IngredientListResponse>('/ingredients', token);
    },
  });
}

export function useCreateIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateIngredientDto) => {
      const token = await getToken();
      return api.post<Ingredient>('/ingredients', dto, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  });
}

export function useUpdateIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateIngredientDto }) => {
      const token = await getToken();
      return api.put<Ingredient>(`/ingredients/${id}`, dto, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  });
}

export function useDeleteIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return api.delete(`/ingredients/${id}`, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  });
}
