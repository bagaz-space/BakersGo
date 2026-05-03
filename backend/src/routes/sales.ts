import type { FastifyInstance } from 'fastify';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { requireAuth, getUserId } from '../middleware/auth';
import type { CreateSaleDto, UpdateSaleDto } from '@bakersgo/types';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function saleRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { from?: string; to?: string } }>(
    '/sales',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { from, to } = request.query;

      const where: Record<string, unknown> = { userId };
      if (from || to) {
        where.date = {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        };
      }

      const sales = await prisma.sale.findMany({ where, orderBy: { date: 'desc' } });
      const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
      return reply.send({ data: sales, total: sales.length, totalRevenue });
    },
  );

  app.post<{ Body: CreateSaleDto }>(
    '/sales',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { date, itemName, recipeId, qty, pricePerUnit } = request.body;
      const totalRevenue = qty * pricePerUnit;
      const sale = await prisma.sale.create({
        data: { date: new Date(date), itemName, recipeId, qty, pricePerUnit, totalRevenue, userId },
      });
      return reply.status(201).send(sale);
    },
  );

  app.put<{ Params: { id: string }; Body: UpdateSaleDto }>(
    '/sales/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { id } = request.params;
      const existing = await prisma.sale.findFirst({ where: { id, userId } });
      if (!existing) return reply.status(404).send({ message: 'Penjualan tidak ditemukan' });

      const body = request.body;
      const qty = body.qty ?? existing.qty;
      const pricePerUnit = body.pricePerUnit ?? existing.pricePerUnit;
      const data = {
        ...body,
        ...(body.date ? { date: new Date(body.date) } : {}),
        totalRevenue: qty * pricePerUnit,
      };
      const updated = await prisma.sale.update({ where: { id }, data });
      return reply.send(updated);
    },
  );

  app.delete<{ Params: { id: string } }>(
    '/sales/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { id } = request.params;
      const existing = await prisma.sale.findFirst({ where: { id, userId } });
      if (!existing) return reply.status(404).send({ message: 'Penjualan tidak ditemukan' });
      await prisma.sale.delete({ where: { id } });
      return reply.status(204).send();
    },
  );
}
