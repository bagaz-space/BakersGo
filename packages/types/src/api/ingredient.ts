export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  packagePrice: number;
  packageVolume: number;
  pricePerUnit: number;
  stock: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIngredientDto {
  name: string;
  unit: string;
  packagePrice: number;
  packageVolume: number;
  stock: number;
}

export interface UpdateIngredientDto extends Partial<CreateIngredientDto> {}

export interface IngredientListResponse {
  data: Ingredient[];
  total: number;
}
