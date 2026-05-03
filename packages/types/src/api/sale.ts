export interface Sale {
  id: string;
  date: string;
  recipeId?: string;
  recipeName?: string;
  itemName: string;
  qty: number;
  pricePerUnit: number;
  totalRevenue: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleDto {
  date: string;
  recipeId?: string;
  itemName: string;
  qty: number;
  pricePerUnit: number;
}

export interface UpdateSaleDto extends Partial<CreateSaleDto> {}

export interface SaleListResponse {
  data: Sale[];
  total: number;
  totalRevenue: number;
}
