import type { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { hppService } from '../services/hpp.service';
import type { CreateHppDto, UpdateHppDto } from '@bakersgo/types';

export async function hppRoutes(app: FastifyInstance) {
  app.get('/hpp', { preHandler: requireAuth }, async (request, reply) => {
    const userId = getUserId(request);
    return reply.send(await hppService.list(userId));
  });

  app.post<{ Body: CreateHppDto }>(
    '/hpp',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const entry = await hppService.create(userId, request.body);
      return reply.status(201).send(entry);
    },
  );

  app.put<{ Params: { id: string }; Body: UpdateHppDto }>(
    '/hpp/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const result = await hppService.update(userId, request.params.id, request.body);
      if (!result) return reply.status(404).send({ message: 'HPP entry tidak ditemukan' });
      return reply.send(result);
    },
  );

  app.delete<{ Params: { id: string } }>(
    '/hpp/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const deleted = await hppService.delete(userId, request.params.id);
      if (!deleted) return reply.status(404).send({ message: 'HPP entry tidak ditemukan' });
      return reply.status(204).send();
    },
  );
}
