export interface HppZoneCost {
  label: string;
  amount: number;
}

export interface HppResult {
  recipeId: string;
  recipeName: string;
  batchSize: number;
  batchUnit: string;
  baseRecipeCost: number;
  additionalCosts: HppZoneCost[];
  totalCogs: number;
  cogsPerUnit: number;
  suggestedPrice?: number;
  marginPercent?: number;
}

export interface CalculateHppDto {
  recipeId: string;
  additionalCosts: HppZoneCost[];
  desiredMarginPercent?: number;
}
