export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  ingredientName: string;
  unit: string;
  amount: number;
  pricePerUnit: number;
  subtotal: number;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  batchSize: number;
  batchUnit: string;
  baseRecipeCost: number;
  ingredients: RecipeIngredient[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeDto {
  name: string;
  description?: string;
  batchSize: number;
  batchUnit: string;
  ingredients: {
    ingredientId: string;
    amount: number;
  }[];
}

export interface UpdateRecipeDto extends Partial<CreateRecipeDto> {}

export interface RecipeListResponse {
  data: Recipe[];
  total: number;
}
