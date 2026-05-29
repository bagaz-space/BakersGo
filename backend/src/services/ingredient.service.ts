import { prisma } from '../lib/prisma';
import type { CreateIngredientDto, UpdateIngredientDto } from '@bakersgo/types';

export const ingredientService = {
  async list(userId: string) {
    const items = await prisma.ingredient.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return { data: items, total: items.length };
  },

  async create(userId: string, dto: CreateIngredientDto) {
    const { name, unit, packagePrice, packageVolume, stock } = dto;
    const pricePerUnit = packagePrice / packageVolume;
    return prisma.ingredient.create({
      data: { name, unit, packagePrice, packageVolume, pricePerUnit, stock: stock ?? 0, userId },
    });
  },

  async update(userId: string, id: string, dto: UpdateIngredientDto) {
    const existing = await prisma.ingredient.findFirst({ where: { id, userId } });
    if (!existing) return null;

    const data: Record<string, unknown> = { ...dto };
    if (dto.packagePrice !== undefined || dto.packageVolume !== undefined) {
      const price = dto.packagePrice ?? existing.packagePrice;
      const volume = dto.packageVolume ?? existing.packageVolume;
      data.pricePerUnit = price / volume;
    }
    return prisma.ingredient.update({ where: { id }, data });
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.ingredient.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.ingredient.delete({ where: { id } });
    return true;
  },
};
