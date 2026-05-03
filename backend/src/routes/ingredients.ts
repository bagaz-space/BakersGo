import type { FastifyInstance } from 'fastify';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { requireAuth, getUserId } from '../middleware/auth';
import type { CreateIngredientDto, UpdateIngredientDto } from '@bakersgo/types';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function ingredientRoutes(app: FastifyInstance) {
  // GET /ingredients
  app.get('/ingredients', { preHandler: requireAuth }, async (request, reply) => {
    const userId = getUserId(request);
    const ingredients = await prisma.ingredient.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return reply.send({ data: ingredients, total: ingredients.length });
  });

  // POST /ingredients
  app.post<{ Body: CreateIngredientDto }>(
    '/ingredients',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { name, unit, packagePrice, packageVolume, stock } = request.body;
      const pricePerUnit = packagePrice / packageVolume;

      const ingredient = await prisma.ingredient.create({
        data: { name, unit, packagePrice, packageVolume, pricePerUnit, stock: stock ?? 0, userId },
      });
      return reply.status(201).send(ingredient);
    },
  );

  // PUT /ingredients/:id
  app.put<{ Params: { id: string }; Body: UpdateIngredientDto }>(
    '/ingredients/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { id } = request.params;

      const existing = await prisma.ingredient.findFirst({ where: { id, userId } });
      if (!existing) return reply.status(404).send({ message: 'Bahan tidak ditemukan' });

      const data = request.body;
      if (data.packagePrice !== undefined || data.packageVolume !== undefined) {
        const price = data.packagePrice ?? existing.packagePrice;
        const volume = data.packageVolume ?? existing.packageVolume;
        (data as Record<string, unknown>).pricePerUnit = price / volume;
      }

      const updated = await prisma.ingredient.update({ where: { id }, data });
      return reply.send(updated);
    },
  );

  // DELETE /ingredients/:id
  app.delete<{ Params: { id: string } }>(
    '/ingredients/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { id } = request.params;

      const existing = await prisma.ingredient.findFirst({ where: { id, userId } });
      if (!existing) return reply.status(404).send({ message: 'Bahan tidak ditemukan' });

      await prisma.ingredient.delete({ where: { id } });
      return reply.status(204).send();
    },
  );
}
