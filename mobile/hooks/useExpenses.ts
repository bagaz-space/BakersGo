import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseRepository } from '@/infrastructure/repositories/ExpenseRepository';
import type { Expense, CreateExpenseDto, UpdateExpenseDto, ExpenseListResponse } from '@bakersgo/types';

export function useExpenses(from?: string, to?: string) {
  return useQuery<ExpenseListResponse>({
    queryKey: ['expenses', from, to],
    queryFn: () => expenseRepository.list(from, to),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation<Expense, Error, CreateExpenseDto>({
    mutationFn: (dto) => expenseRepository.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation<Expense, Error, { id: string; dto: UpdateExpenseDto }>({
    mutationFn: ({ id, dto }) => expenseRepository.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => expenseRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
