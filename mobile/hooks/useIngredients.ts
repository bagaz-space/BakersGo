import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type {
  Ingredient,
  CreateIngredientDto,
  UpdateIngredientDto,
  IngredientListResponse,
} from '@bakersgo/types';

export function useIngredients() {
  return useQuery<IngredientListResponse>({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const token = await getToken();
      return api.get<IngredientListResponse>('/ingredients', token ?? undefined);
    },
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();
  return useMutation<Ingredient, Error, CreateIngredientDto>({
    mutationFn: async (dto) => {
      const token = await getToken();
      return api.post<Ingredient>('/ingredients', dto, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();
  return useMutation<Ingredient, Error, { id: string; dto: UpdateIngredientDto }>({
    mutationFn: async ({ id, dto }) => {
      const token = await getToken();
      return api.put<Ingredient>(`/ingredients/${id}`, dto, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken();
      return api.delete<void>(`/ingredients/${id}`, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
}
