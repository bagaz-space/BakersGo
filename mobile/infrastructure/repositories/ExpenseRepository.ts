import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Expense, CreateExpenseDto, UpdateExpenseDto, ExpenseListResponse } from '@bakersgo/types';

async function token() {
  return (await getToken()) ?? undefined;
}

export const expenseRepository = {
  list: async (from?: string, to?: string): Promise<ExpenseListResponse> => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString();
    return api.get<ExpenseListResponse>(`/expenses${query ? `?${query}` : ''}`, await token());
  },

  create: async (dto: CreateExpenseDto): Promise<Expense> =>
    api.post<Expense>('/expenses', dto, await token()),

  update: async (id: string, dto: UpdateExpenseDto): Promise<Expense> =>
    api.put<Expense>(`/expenses/${id}`, dto, await token()),

  remove: async (id: string): Promise<void> =>
    api.delete<void>(`/expenses/${id}`, await token()),
};
