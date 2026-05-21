import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type ExpenseCategory = 'BAHAN_BAKU' | 'OPERASIONAL' | 'LISTRIK' | 'GAJI' | 'LAINNYA';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
}

export interface ExpenseListResponse {
  data: Expense[];
  total: number;
  totalAmount: number;
}

export function useExpenses(from?: string, to?: string) {
  return useQuery<ExpenseListResponse>({
    queryKey: ['expenses', from, to],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const query = params.toString();
      return api.get<ExpenseListResponse>(`/expenses${query ? `?${query}` : ''}`, token ?? undefined);
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation<Expense, Error, CreateExpenseDto>({
    mutationFn: async (dto) => {
      const token = await getToken();
      return api.post<Expense>('/expenses', dto, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation<Expense, Error, { id: string; dto: CreateExpenseDto }>({
    mutationFn: async ({ id, dto }) => {
      const token = await getToken();
      return api.put<Expense>(`/expenses/${id}`, dto, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken();
      return api.delete<void>(`/expenses/${id}`, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
