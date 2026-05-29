import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Ingredient, CreateIngredientDto, UpdateIngredientDto, IngredientListResponse } from '@bakersgo/types';

async function token() {
  return (await getToken()) ?? undefined;
}

export const ingredientRepository = {
  list: (): Promise<IngredientListResponse> =>
    token().then((t) => api.get<IngredientListResponse>('/ingredients', t)),

  create: async (dto: CreateIngredientDto): Promise<Ingredient> =>
    api.post<Ingredient>('/ingredients', dto, await token()),

  update: async (id: string, dto: UpdateIngredientDto): Promise<Ingredient> =>
    api.put<Ingredient>(`/ingredients/${id}`, dto, await token()),

  remove: async (id: string): Promise<void> =>
    api.delete<void>(`/ingredients/${id}`, await token()),
};
