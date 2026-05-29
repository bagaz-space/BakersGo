import type { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import type { CreateRecipeDto, UpdateRecipeDto } from '@bakersgo/types';

async function computeBaseRecipeCost(
  prismaClient: typeof prisma,
  ingredients: { ingredientId: string; amount: number }[],
) {
  let total = 0;
  for (const item of ingredients) {
    const ing = await prismaClient.ingredient.findUnique({ where: { id: item.ingredientId } });
    if (ing) total += ing.pricePerUnit * item.amount;
  }
  return total;
}

export async function recipeRoutes(app: FastifyInstance) {
  // GET /recipes
  app.get('/recipes', { preHandler: requireAuth }, async (request, reply) => {
    const userId = getUserId(request);
    const recipes = await prisma.recipe.findMany({
      where: { userId },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const mapped = recipes.map((r) => ({
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
    }));

    return reply.send({ data: mapped, total: mapped.length });
  });

  // POST /recipes
  app.post<{ Body: CreateRecipeDto }>(
    '/recipes',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { name, description, batchSize, batchUnit, ingredients } = request.body;

      const baseRecipeCost = await computeBaseRecipeCost(prisma, ingredients);

      const recipe = await prisma.recipe.create({
        data: {
          name,
          description,
          batchSize,
          batchUnit,
          baseRecipeCost,
          userId,
          ingredients: {
            create: ingredients.map((i) => ({
              ingredientId: i.ingredientId,
              amount: i.amount,
            })),
          },
        },
        include: { ingredients: { include: { ingredient: true } } },
      });

      return reply.status(201).send(recipe);
    },
  );

  // PUT /recipes/:id
  app.put<{ Params: { id: string }; Body: UpdateRecipeDto }>(
    '/recipes/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { id } = request.params;

      const existing = await prisma.recipe.findFirst({ where: { id, userId } });
      if (!existing) return reply.status(404).send({ message: 'Resep tidak ditemukan' });

      const { name, description, batchSize, batchUnit, ingredients } = request.body;

      let baseRecipeCost = existing.baseRecipeCost;
      if (ingredients) {
        baseRecipeCost = await computeBaseRecipeCost(prisma, ingredients);
        await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
        await prisma.recipeIngredient.createMany({
          data: ingredients.map((i) => ({ recipeId: id, ingredientId: i.ingredientId, amount: i.amount })),
        });
      }

      const updated = await prisma.recipe.update({
        where: { id },
        data: { name, description, batchSize, batchUnit, baseRecipeCost },
        include: { ingredients: { include: { ingredient: true } } },
      });

      return reply.send(updated);
    },
  );

  // DELETE /recipes/:id
  app.delete<{ Params: { id: string } }>(
    '/recipes/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { id } = request.params;

      const existing = await prisma.recipe.findFirst({ where: { id, userId } });
      if (!existing) return reply.status(404).send({ message: 'Resep tidak ditemukan' });

      await prisma.recipe.delete({ where: { id } });
      return reply.status(204).send();
    },
  );
}
