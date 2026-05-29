import type { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import type { CreateHppDto, UpdateHppDto } from '@bakersgo/types';

export async function hppRoutes(app: FastifyInstance) {
  // GET /hpp
  app.get('/hpp', { preHandler: requireAuth }, async (request, reply) => {
    const userId = getUserId(request);
    const entries = await prisma.hppEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ data: entries, total: entries.length });
  });

  // POST /hpp
  app.post<{ Body: CreateHppDto }>(
    '/hpp',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const {
        recipeId, recipeName, batchSize, batchUnit, baseRecipeCost,
        listrik, gas, tenagaKerja, overhead,
        kotak, stiker, kemasanLain,
        marginReseller, marginEndUser,
        hppTotal, hppPerUnit, hargaReseller, hargaEndUser,
      } = request.body;

      const entry = await prisma.hppEntry.create({
        data: {
          userId, recipeId, recipeName, batchSize, batchUnit, baseRecipeCost,
          listrik, gas, tenagaKerja, overhead,
          kotak, stiker, kemasanLain,
          marginReseller, marginEndUser,
          hppTotal, hppPerUnit, hargaReseller, hargaEndUser,
        },
      });

      return reply.status(201).send(entry);
    },
  );

  // PUT /hpp/:id
  app.put<{ Params: { id: string }; Body: UpdateHppDto }>(
    '/hpp/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { id } = request.params;
      const existing = await prisma.hppEntry.findFirst({ where: { id, userId } });
      if (!existing) return reply.status(404).send({ message: 'HPP entry tidak ditemukan' });

      const updated = await prisma.hppEntry.update({ where: { id }, data: request.body });
      return reply.send(updated);
    },
  );

  // DELETE /hpp/:id
  app.delete<{ Params: { id: string } }>(
    '/hpp/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { id } = request.params;
      const existing = await prisma.hppEntry.findFirst({ where: { id, userId } });
      if (!existing) return reply.status(404).send({ message: 'HPP entry tidak ditemukan' });
      await prisma.hppEntry.delete({ where: { id } });
      return reply.status(204).send();
    },
  );
}
