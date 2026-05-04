export interface HppEntry {
  id: string;
  userId: string;
  recipeId: string;
  recipeName: string;
  batchSize: number;
  batchUnit: string;
  baseRecipeCost: number;
  listrik: number;
  gas: number;
  tenagaKerja: number;
  overhead: number;
  kotak: number;
  stiker: number;
  kemasanLain: number;
  marginReseller: number;
  marginEndUser: number;
  hppTotal: number;
  hppPerUnit: number;
  hargaReseller: number;
  hargaEndUser: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHppDto {
  recipeId: string;
  recipeName: string;
  batchSize: number;
  batchUnit: string;
  baseRecipeCost: number;
  listrik: number;
  gas: number;
  tenagaKerja: number;
  overhead: number;
  kotak: number;
  stiker: number;
  kemasanLain: number;
  marginReseller: number;
  marginEndUser: number;
  hppTotal: number;
  hppPerUnit: number;
  hargaReseller: number;
  hargaEndUser: number;
}

export interface HppListResponse {
  data: HppEntry[];
  total: number;
}
