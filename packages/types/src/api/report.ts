export interface ReportSummary {
  fromDate: string;
  toDate: string;
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  realBalance: number;
  electricityReserve: number;
  titheAmount: number;
  capitalReserve: number;
  safeBalance: number;
  salesCount: number;
  expensesCount: number;
}

export interface DailyBreakdown {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ReportResponse {
  summary: ReportSummary;
  dailyBreakdown: DailyBreakdown[];
}

export interface ReportQueryParams {
  from: string;
  to: string;
}
