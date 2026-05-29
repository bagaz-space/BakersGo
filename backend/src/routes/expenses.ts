import type { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { expenseService } from '../services/expense.service';
import type { CreateExpenseDto, UpdateExpenseDto } from '@bakersgo/types';

export async function expenseRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { from?: string; to?: string } }>(
    '/expenses',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { from, to } = request.query;
      return reply.send(await expenseService.list(userId, from, to));
    },
  );

  app.post<{ Body: CreateExpenseDto }>(
    '/expenses',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const expense = await expenseService.create(userId, request.body);
      return reply.status(201).send(expense);
    },
  );

  app.put<{ Params: { id: string }; Body: UpdateExpenseDto }>(
    '/expenses/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const result = await expenseService.update(userId, request.params.id, request.body);
      if (!result) return reply.status(404).send({ message: 'Pengeluaran tidak ditemukan' });
      return reply.send(result);
    },
  );

  app.delete<{ Params: { id: string } }>(
    '/expenses/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const deleted = await expenseService.delete(userId, request.params.id);
      if (!deleted) return reply.status(404).send({ message: 'Pengeluaran tidak ditemukan' });
      return reply.status(204).send();
    },
  );
}
