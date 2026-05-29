import type { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { reportService } from '../services/report.service';

export async function reportRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { from: string; to: string } }>(
    '/reports/summary',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { from, to } = request.query;

      if (!from || !to) {
        return reply.status(400).send({ message: 'Parameter from dan to wajib diisi' });
      }

      return reply.send(await reportService.getSummary(userId, from, to));
    },
  );
}
