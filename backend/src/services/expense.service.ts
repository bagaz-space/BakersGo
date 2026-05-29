import { prisma } from '../lib/prisma';
import type { CreateExpenseDto, UpdateExpenseDto } from '@bakersgo/types';

export const expenseService = {
  async list(userId: string, from?: string, to?: string) {
    const where: Record<string, unknown> = { userId };
    if (from || to) {
      where.date = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }
    const expenses = await prisma.expense.findMany({ where, orderBy: { date: 'desc' } });
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    return { data: expenses, total: expenses.length, totalAmount };
  },

  async create(userId: string, dto: CreateExpenseDto) {
    const { date, category, description, amount } = dto;
    return prisma.expense.create({
      data: { date: new Date(date), category, description, amount, userId },
    });
  },

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    const existing = await prisma.expense.findFirst({ where: { id, userId } });
    if (!existing) return null;
    const data = { ...dto, ...(dto.date ? { date: new Date(dto.date) } : {}) };
    return prisma.expense.update({ where: { id }, data });
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.expense.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.expense.delete({ where: { id } });
    return true;
  },
};
