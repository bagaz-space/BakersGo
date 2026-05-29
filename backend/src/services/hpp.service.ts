import { prisma } from '../lib/prisma';
import type { CreateHppDto, UpdateHppDto } from '@bakersgo/types';

export const hppService = {
  async list(userId: string) {
    const entries = await prisma.hppEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: entries, total: entries.length };
  },

  async create(userId: string, dto: CreateHppDto) {
    return prisma.hppEntry.create({ data: { ...dto, userId } });
  },

  async update(userId: string, id: string, dto: UpdateHppDto) {
    const existing = await prisma.hppEntry.findFirst({ where: { id, userId } });
    if (!existing) return null;
    return prisma.hppEntry.update({ where: { id }, data: dto });
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.hppEntry.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.hppEntry.delete({ where: { id } });
    return true;
  },
};
