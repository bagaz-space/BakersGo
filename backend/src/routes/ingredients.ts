import type { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { ingredientService } from '../services/ingredient.service';
import type { CreateIngredientDto, UpdateIngredientDto } from '@bakersgo/types';

export async function ingredientRoutes(app: FastifyInstance) {
  app.get('/ingredients', { preHandler: requireAuth }, async (request, reply) => {
    const userId = getUserId(request);
    return reply.send(await ingredientService.list(userId));
  });

  app.post<{ Body: CreateIngredientDto }>(
    '/ingredients',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const ingredient = await ingredientService.create(userId, request.body);
      return reply.status(201).send(ingredient);
    },
  );

  app.put<{ Params: { id: string }; Body: UpdateIngredientDto }>(
    '/ingredients/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const result = await ingredientService.update(userId, request.params.id, request.body);
      if (!result) return reply.status(404).send({ message: 'Bahan tidak ditemukan' });
      return reply.send(result);
    },
  );

  app.delete<{ Params: { id: string } }>(
    '/ingredients/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const deleted = await ingredientService.delete(userId, request.params.id);
      if (!deleted) return reply.status(404).send({ message: 'Bahan tidak ditemukan' });
      return reply.status(204).send();
    },
  );
}
