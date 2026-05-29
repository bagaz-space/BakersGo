import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { requireAuth, getUserId } from '../middleware/auth';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@bakersgo/types';

function createPrisma() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

function toUserProfile(user: {
  id: string;
  email: string;
  userId: string;
  brandName: string;
  createdAt: Date;
}): UserProfile {
  return {
    id: user.id,
    email: user.email,
    userId: user.userId,
    brandName: user.brandName,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterRequest }>('/auth/register', async (request, reply) => {
    const { email, userId, brandName, password } = request.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { userId }] },
    });
    if (existing) {
      return reply
        .status(409)
        .send({ message: 'Email atau username sudah digunakan' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, userId, brandName, password: hashed },
    });

    const token = app.jwt.sign({ sub: user.id, email: user.email });
    const response: AuthResponse = { token, user: toUserProfile(user) };
    return reply.status(201).send(response);
  });

  app.post<{ Body: LoginRequest }>('/auth/login', async (request, reply) => {
    const { email, password } = request.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ message: 'Email atau password salah' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.status(401).send({ message: 'Email atau password salah' });
    }

    const token = app.jwt.sign({ sub: user.id, email: user.email });
    const response: AuthResponse = { token, user: toUserProfile(user) };
    return reply.send(response);
  });

  app.get(
    '/auth/profile',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return reply.status(404).send({ message: 'User tidak ditemukan' });
      return reply.send(toUserProfile(user));
    },
  );

  app.patch<{ Body: UpdateProfileRequest }>(
    '/auth/profile',
    { preHandler: requireAuth },
    async (request, reply) => {
      const id = getUserId(request);
      const { userId, brandName } = request.body;

      if (userId) {
        const conflict = await prisma.user.findFirst({
          where: { userId, NOT: { id } },
        });
        if (conflict) {
          return reply.status(409).send({ message: 'Username sudah digunakan' });
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(userId !== undefined && { userId }),
          ...(brandName !== undefined && { brandName }),
        },
      });

      return reply.send(toUserProfile(user));
    },
  );

  app.post<{ Body: ChangePasswordRequest }>(
    '/auth/change-password',
    { preHandler: requireAuth },
    async (request, reply) => {
      const id = getUserId(request);
      const { currentPassword, newPassword } = request.body;

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return reply.status(404).send({ message: 'User tidak ditemukan' });

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return reply.status(401).send({ message: 'Password saat ini tidak sesuai' });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id }, data: { password: hashed } });

      return reply.status(204).send();
    },
  );
}
