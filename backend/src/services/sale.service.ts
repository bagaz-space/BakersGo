import { prisma } from '../lib/prisma';
import type { CreateSaleDto, UpdateSaleDto } from '@bakersgo/types';

export const saleService = {
  async list(userId: string, from?: string, to?: string) {
    const where: Record<string, unknown> = { userId };
    if (from || to) {
      where.date = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }
    const sales = await prisma.sale.findMany({ where, orderBy: { date: 'desc' } });
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
    return { data: sales, total: sales.length, totalRevenue };
  },

  async create(userId: string, dto: CreateSaleDto) {
    const { date, itemName, recipeId, qty, pricePerUnit } = dto;
    const totalRevenue = qty * pricePerUnit;
    return prisma.sale.create({
      data: { date: new Date(date), itemName, recipeId, qty, pricePerUnit, totalRevenue, userId },
    });
  },

  async update(userId: string, id: string, dto: UpdateSaleDto) {
    const existing = await prisma.sale.findFirst({ where: { id, userId } });
    if (!existing) return null;

    const qty = dto.qty ?? existing.qty;
    const pricePerUnit = dto.pricePerUnit ?? existing.pricePerUnit;
    const data = {
      ...dto,
      ...(dto.date ? { date: new Date(dto.date) } : {}),
      totalRevenue: qty * pricePerUnit,
    };
    return prisma.sale.update({ where: { id }, data });
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.sale.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.sale.delete({ where: { id } });
    return true;
  },
};
