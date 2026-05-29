import type { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { saleService } from '../services/sale.service';
import type { CreateSaleDto, UpdateSaleDto } from '@bakersgo/types';

export async function saleRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { from?: string; to?: string } }>(
    '/sales',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { from, to } = request.query;
      return reply.send(await saleService.list(userId, from, to));
    },
  );

  app.post<{ Body: CreateSaleDto }>(
    '/sales',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const sale = await saleService.create(userId, request.body);
      return reply.status(201).send(sale);
    },
  );

  app.put<{ Params: { id: string }; Body: UpdateSaleDto }>(
    '/sales/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const result = await saleService.update(userId, request.params.id, request.body);
      if (!result) return reply.status(404).send({ message: 'Penjualan tidak ditemukan' });
      return reply.send(result);
    },
  );

  app.delete<{ Params: { id: string } }>(
    '/sales/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const deleted = await saleService.delete(userId, request.params.id);
      if (!deleted) return reply.status(404).send({ message: 'Penjualan tidak ditemukan' });
      return reply.status(204).send();
    },
  );
}
