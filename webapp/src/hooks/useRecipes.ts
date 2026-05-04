'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Recipe, CreateRecipeDto, UpdateRecipeDto, RecipeListResponse } from '@bakersgo/types';

async function getToken(): Promise<string | undefined> {
  const res = await fetch('/api/auth/token');
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.token as string | undefined;
}

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const token = await getToken();
      return api.get<RecipeListResponse>('/recipes', token);
    },
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateRecipeDto) => {
      const token = await getToken();
      return api.post<Recipe>('/recipes', dto, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useUpdateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateRecipeDto }) => {
      const token = await getToken();
      return api.put<Recipe>(`/recipes/${id}`, dto, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return api.delete(`/recipes/${id}`, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });
}
