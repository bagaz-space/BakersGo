import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type {
  Recipe,
  CreateRecipeDto,
  UpdateRecipeDto,
  RecipeListResponse,
} from '@bakersgo/types';

export function useRecipes() {
  return useQuery<RecipeListResponse>({
    queryKey: ['recipes'],
    queryFn: async () => {
      const token = await getToken();
      return api.get<RecipeListResponse>('/recipes', token ?? undefined);
    },
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation<Recipe, Error, CreateRecipeDto>({
    mutationFn: async (dto) => {
      const token = await getToken();
      return api.post<Recipe>('/recipes', dto, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation<Recipe, Error, { id: string; dto: UpdateRecipeDto }>({
    mutationFn: async ({ id, dto }) => {
      const token = await getToken();
      return api.put<Recipe>(`/recipes/${id}`, dto, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken();
      return api.delete<void>(`/recipes/${id}`, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}
