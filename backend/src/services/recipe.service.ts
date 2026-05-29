import { prisma } from '../lib/prisma';
import type { CreateRecipeDto, UpdateRecipeDto } from '@bakersgo/types';

async function computeBaseRecipeCost(
  ingredients: { ingredientId: string; amount: number }[],
): Promise<number> {
  let total = 0;
  for (const item of ingredients) {
    const ing = await prisma.ingredient.findUnique({ where: { id: item.ingredientId } });
    if (ing) total += ing.pricePerUnit * item.amount;
  }
  return total;
}

type RecipeWithIngredients = Awaited<ReturnType<typeof prisma.recipe.findFirst>> & {
  ingredients: Array<{
    id: string;
    ingredientId: string;
    amount: number;
    ingredient: { name: string; unit: string; pricePerUnit: number };
  }>;
};

function mapRecipe(r: NonNullable<RecipeWithIngredients>) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    batchSize: r.batchSize,
    batchUnit: r.batchUnit,
    baseRecipeCost: r.baseRecipeCost,
    userId: r.userId,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    ingredients: r.ingredients.map((ri) => ({
      id: ri.id,
      ingredientId: ri.ingredientId,
      ingredientName: ri.ingredient.name,
      unit: ri.ingredient.unit,
      amount: ri.amount,
      pricePerUnit: ri.ingredient.pricePerUnit,
      subtotal: ri.ingredient.pricePerUnit * ri.amount,
    })),
  };
}

const includeIngredients = {
  ingredients: { include: { ingredient: true } },
} as const;

export const recipeService = {
  async list(userId: string) {
    const recipes = await prisma.recipe.findMany({
      where: { userId },
      include: includeIngredients,
      orderBy: { name: 'asc' },
    });
    const data = recipes.map(mapRecipe);
    return { data, total: data.length };
  },

  async create(userId: string, dto: CreateRecipeDto) {
    const { name, description, batchSize, batchUnit, ingredients } = dto;
    const baseRecipeCost = await computeBaseRecipeCost(ingredients);
    const recipe = await prisma.recipe.create({
      data: {
        name, description, batchSize, batchUnit, baseRecipeCost, userId,
        ingredients: { create: ingredients.map((i) => ({ ingredientId: i.ingredientId, amount: i.amount })) },
      },
      include: includeIngredients,
    });
    return mapRecipe(recipe);
  },

  async update(userId: string, id: string, dto: UpdateRecipeDto) {
    const existing = await prisma.recipe.findFirst({ where: { id, userId } });
    if (!existing) return null;

    const { name, description, batchSize, batchUnit, ingredients } = dto;
    let baseRecipeCost = existing.baseRecipeCost;

    if (ingredients) {
      baseRecipeCost = await computeBaseRecipeCost(ingredients);
      await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
      await prisma.recipeIngredient.createMany({
        data: ingredients.map((i) => ({ recipeId: id, ingredientId: i.ingredientId, amount: i.amount })),
      });
    }

    const updated = await prisma.recipe.update({
      where: { id },
      data: { name, description, batchSize, batchUnit, baseRecipeCost },
      include: includeIngredients,
    });
    return mapRecipe(updated);
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.recipe.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.recipe.delete({ where: { id } });
    return true;
  },
};
