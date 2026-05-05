'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Expense,
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseListResponse,
} from '@bakersgo/types';

async function getToken(): Promise<string | undefined> {
  const res = await fetch('/api/auth/token');
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.token as string | undefined;
}

export function useExpenses(from?: string, to?: string) {
  return useQuery({
    queryKey: ['expenses', from, to],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      return api.get<ExpenseListResponse>(`/expenses${qs ? `?${qs}` : ''}`, token);
    },
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateExpenseDto) => {
      const token = await getToken();
      return api.post<Expense>('/expenses', dto, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateExpenseDto }) => {
      const token = await getToken();
      return api.put<Expense>(`/expenses/${id}`, dto, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return api.delete(`/expenses/${id}`, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
