export type ExpenseCategory =
  | 'BAHAN_BAKU'
  | 'OPERASIONAL'
  | 'LISTRIK'
  | 'GAJI'
  | 'LAINNYA';

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

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}

export interface ExpenseListResponse {
  data: Expense[];
  total: number;
  totalAmount: number;
}
