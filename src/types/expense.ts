export type ExpenseCategory = 
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string; // ISO string format
  vendor?: string; // Optional vendor field - used when available, falls back to description extraction
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  amount: string;
  description: string;
  category: ExpenseCategory;
  date: string;
  vendor?: string; // Optional vendor field for form input
}

export interface ExpenseFilters {
  category?: ExpenseCategory | 'All';
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface ExpenseSummary {
  totalSpent: number;
  monthlySpent: number;
  topCategory: {
    name: ExpenseCategory;
    amount: number;
  } | null;
  categoryBreakdown: Array<{
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  }>;
}