import { ExpenseCategory } from './expense';

export interface Vendor {
  name: string;
  totalSpent: number;
  transactionCount: number;
  categories: ExpenseCategory[];
  averageTransaction: number;
  firstTransaction: string; // ISO date string
  lastTransaction: string; // ISO date string
}

export interface VendorSummary {
  topVendors: Vendor[];
  totalVendors: number;
  totalSpent: number;
  averageSpentPerVendor: number;
}

export interface VendorFilters {
  category?: ExpenseCategory | 'All';
  minSpent?: number;
  maxSpent?: number;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface VendorChartData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}