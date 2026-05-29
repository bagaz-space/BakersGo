import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import type {
  UserProfile,
  RegisterRequest,
  UpdateProfileRequest,
} from '@bakersgo/types';

export function toUserProfile(user: {
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

export const authService = {
  async register(dto: RegisterRequest) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { userId: dto.userId }] },
    });
    if (existing) return null;

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await prisma.user.create({
      data: { email: dto.email, userId: dto.userId, brandName: dto.brandName, password: hashed },
    });
    return toUserProfile(user);
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    return toUserProfile(user);
  },

  async getProfile(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toUserProfile(user) : null;
  },

  async updateProfile(id: string, dto: UpdateProfileRequest) {
    if (dto.userId) {
      const conflict = await prisma.user.findFirst({ where: { userId: dto.userId, NOT: { id } } });
      if (conflict) return 'conflict' as const;
    }
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(dto.userId !== undefined && { userId: dto.userId }),
        ...(dto.brandName !== undefined && { brandName: dto.brandName }),
      },
    });
    return toUserProfile(user);
  },

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return 'not_found' as const;
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return 'invalid' as const;
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed } });
    return 'ok' as const;
  },
};
