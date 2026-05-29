import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeRepository } from '@/infrastructure/repositories/RecipeRepository';
import type { Recipe, CreateRecipeDto, UpdateRecipeDto, RecipeListResponse } from '@bakersgo/types';

export function useRecipes() {
  return useQuery<RecipeListResponse>({
    queryKey: ['recipes'],
    queryFn: () => recipeRepository.list(),
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation<Recipe, Error, CreateRecipeDto>({
    mutationFn: (dto) => recipeRepository.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation<Recipe, Error, { id: string; dto: UpdateRecipeDto }>({
    mutationFn: ({ id, dto }) => recipeRepository.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => recipeRepository.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  });
}
