import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Recipe, CreateRecipeDto, UpdateRecipeDto, RecipeListResponse } from '@bakersgo/types';

async function token() {
  return (await getToken()) ?? undefined;
}

export const recipeRepository = {
  list: (): Promise<RecipeListResponse> =>
    token().then((t) => api.get<RecipeListResponse>('/recipes', t)),

  create: async (dto: CreateRecipeDto): Promise<Recipe> =>
    api.post<Recipe>('/recipes', dto, await token()),

  update: async (id: string, dto: UpdateRecipeDto): Promise<Recipe> =>
    api.put<Recipe>(`/recipes/${id}`, dto, await token()),

  remove: async (id: string): Promise<void> =>
    api.delete<void>(`/recipes/${id}`, await token()),
};
