import type { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { recipeService } from '../services/recipe.service';
import type { CreateRecipeDto, UpdateRecipeDto } from '@bakersgo/types';

export async function recipeRoutes(app: FastifyInstance) {
  app.get('/recipes', { preHandler: requireAuth }, async (request, reply) => {
    const userId = getUserId(request);
    return reply.send(await recipeService.list(userId));
  });

  app.post<{ Body: CreateRecipeDto }>(
    '/recipes',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const recipe = await recipeService.create(userId, request.body);
      return reply.status(201).send(recipe);
    },
  );

  app.put<{ Params: { id: string }; Body: UpdateRecipeDto }>(
    '/recipes/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const result = await recipeService.update(userId, request.params.id, request.body);
      if (!result) return reply.status(404).send({ message: 'Resep tidak ditemukan' });
      return reply.send(result);
    },
  );

  app.delete<{ Params: { id: string } }>(
    '/recipes/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const deleted = await recipeService.delete(userId, request.params.id);
      if (!deleted) return reply.status(404).send({ message: 'Resep tidak ditemukan' });
      return reply.status(204).send();
    },
  );
}
