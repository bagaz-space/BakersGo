import type { FastifyRequest, FastifyReply } from 'fastify';

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ message: 'Token tidak valid atau sudah kadaluarsa' });
  }
}

export function getUserId(request: FastifyRequest): string {
  const payload = request.user as { sub: string };
  return payload.sub;
}
