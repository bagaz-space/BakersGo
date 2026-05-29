import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ingredientRepository } from '@/infrastructure/repositories/IngredientRepository';
import type { Ingredient, CreateIngredientDto, UpdateIngredientDto, IngredientListResponse } from '@bakersgo/types';

export function useIngredients() {
  return useQuery<IngredientListResponse>({
    queryKey: ['ingredients'],
    queryFn: () => ingredientRepository.list(),
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();
  return useMutation<Ingredient, Error, CreateIngredientDto>({
    mutationFn: (dto) => ingredientRepository.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();
  return useMutation<Ingredient, Error, { id: string; dto: UpdateIngredientDto }>({
    mutationFn: ({ id, dto }) => ingredientRepository.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => ingredientRepository.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  });
}
