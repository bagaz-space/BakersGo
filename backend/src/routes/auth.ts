import type { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { authService } from '../services/auth.service';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@bakersgo/types';

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterRequest }>('/auth/register', async (request, reply) => {
    const user = await authService.register(request.body);
    if (!user) return reply.status(409).send({ message: 'Email atau username sudah digunakan' });

    const token = app.jwt.sign({ sub: user.id, email: user.email });
    const response: AuthResponse = { token, user };
    return reply.status(201).send(response);
  });

  app.post<{ Body: LoginRequest }>('/auth/login', async (request, reply) => {
    const { email, password } = request.body;
    const user = await authService.login(email, password);
    if (!user) return reply.status(401).send({ message: 'Email atau password salah' });

    const token = app.jwt.sign({ sub: user.id, email: user.email });
    const response: AuthResponse = { token, user };
    return reply.send(response);
  });

  app.get('/auth/profile', { preHandler: requireAuth }, async (request, reply) => {
    const id = getUserId(request);
    const user = await authService.getProfile(id);
    if (!user) return reply.status(404).send({ message: 'User tidak ditemukan' });
    return reply.send(user);
  });

  app.patch<{ Body: UpdateProfileRequest }>(
    '/auth/profile',
    { preHandler: requireAuth },
    async (request, reply) => {
      const id = getUserId(request);
      const result = await authService.updateProfile(id, request.body);
      if (result === 'conflict') return reply.status(409).send({ message: 'Username sudah digunakan' });
      return reply.send(result);
    },
  );

  app.post<{ Body: ChangePasswordRequest }>(
    '/auth/change-password',
    { preHandler: requireAuth },
    async (request, reply) => {
      const id = getUserId(request);
      const { currentPassword, newPassword } = request.body;
      const result = await authService.changePassword(id, currentPassword, newPassword);
      if (result === 'not_found') return reply.status(404).send({ message: 'User tidak ditemukan' });
      if (result === 'invalid') return reply.status(401).send({ message: 'Password saat ini tidak sesuai' });
      return reply.status(204).send();
    },
  );
}
