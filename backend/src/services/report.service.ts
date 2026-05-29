import { prisma } from '../lib/prisma';

interface SaleRow { totalRevenue: number; date: Date }
interface ExpenseRow { amount: number; date: Date }

function computeSafeBalance(totalRevenue: number, totalExpenses: number, grossProfit: number) {
  const electricityReserve = totalExpenses * 0.1;
  const titheAmount = grossProfit > 0 ? grossProfit * 0.1 : 0;
  const capitalReserve = totalRevenue * 0.2;
  const realBalance = grossProfit;
  const safeBalance = realBalance - electricityReserve - titheAmount - capitalReserve;
  return { electricityReserve, titheAmount, capitalReserve, realBalance, safeBalance };
}

function buildDailyBreakdown(sales: SaleRow[], expenses: ExpenseRow[]) {
  const dailyMap = new Map<string, { revenue: number; expenses: number }>();

  for (const sale of sales) {
    const day = sale.date.toISOString().split('T')[0];
    const entry = dailyMap.get(day) ?? { revenue: 0, expenses: 0 };
    entry.revenue += sale.totalRevenue;
    dailyMap.set(day, entry);
  }
  for (const expense of expenses) {
    const day = expense.date.toISOString().split('T')[0];
    const entry = dailyMap.get(day) ?? { revenue: 0, expenses: 0 };
    entry.expenses += expense.amount;
    dailyMap.set(day, entry);
  }

  return Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, revenue: v.revenue, expenses: v.expenses, profit: v.revenue - v.expenses }));
}

export const reportService = {
  async getSummary(userId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const [sales, expenses] = await Promise.all([
      prisma.sale.findMany({
        where: { userId, date: { gte: fromDate, lte: toDate } },
        orderBy: { date: 'asc' },
      }),
      prisma.expense.findMany({
        where: { userId, date: { gte: fromDate, lte: toDate } },
        orderBy: { date: 'asc' },
      }),
    ]);

    const totalRevenue = sales.reduce((s, r) => s + r.totalRevenue, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const grossProfit = totalRevenue - totalExpenses;
    const { electricityReserve, titheAmount, capitalReserve, realBalance, safeBalance } =
      computeSafeBalance(totalRevenue, totalExpenses, grossProfit);

    return {
      summary: {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        totalRevenue,
        totalExpenses,
        grossProfit,
        netProfit: grossProfit,
        realBalance,
        electricityReserve,
        titheAmount,
        capitalReserve,
        safeBalance,
        salesCount: sales.length,
        expensesCount: expenses.length,
      },
      dailyBreakdown: buildDailyBreakdown(sales, expenses),
    };
  },
};
