import type { FastifyInstance } from 'fastify';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { requireAuth, getUserId } from '../middleware/auth';
import type { CreateExpenseDto, UpdateExpenseDto } from '@bakersgo/types';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function expenseRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { from?: string; to?: string } }>(
    '/expenses',
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

      const expenses = await prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
      });

      const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
      return reply.send({ data: expenses, total: expenses.length, totalAmount });
    },
  );

  app.post<{ Body: CreateExpenseDto }>(
    '/expenses',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { date, category, description, amount } = request.body;
      const expense = await prisma.expense.create({
        data: { date: new Date(date), category, description, amount, userId },
      });
      return reply.status(201).send(expense);
    },
  );

  app.put<{ Params: { id: string }; Body: UpdateExpenseDto }>(
    '/expenses/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { id } = request.params;
      const existing = await prisma.expense.findFirst({ where: { id, userId } });
      if (!existing) return reply.status(404).send({ message: 'Pengeluaran tidak ditemukan' });

      const data = { ...request.body, ...(request.body.date ? { date: new Date(request.body.date) } : {}) };
      const updated = await prisma.expense.update({ where: { id }, data });
      return reply.send(updated);
    },
  );

  app.delete<{ Params: { id: string } }>(
    '/expenses/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { id } = request.params;
      const existing = await prisma.expense.findFirst({ where: { id, userId } });
      if (!existing) return reply.status(404).send({ message: 'Pengeluaran tidak ditemukan' });
      await prisma.expense.delete({ where: { id } });
      return reply.status(204).send();
    },
  );
}
