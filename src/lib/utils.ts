import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Expense, ExpenseCategory, ExpenseFilters, ExpenseSummary } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const filterExpenses = (expenses: Expense[], filters: ExpenseFilters): Expense[] => {
  return expenses.filter(expense => {
    const matchesCategory = !filters.category || 
      filters.category === 'All' || 
      expense.category === filters.category;

    const matchesDateRange = (!filters.startDate || expense.date >= filters.startDate) &&
      (!filters.endDate || expense.date <= filters.endDate);

    const matchesSearch = !filters.searchQuery || 
      expense.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(filters.searchQuery.toLowerCase());

    return matchesCategory && matchesDateRange && matchesSearch;
  });
};

export const calculateSummary = (expenses: Expense[]): ExpenseSummary => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && 
           expenseDate.getFullYear() === currentYear;
  });
  
  const monthlySpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
    category: category as ExpenseCategory,
    amount,
    percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount);

  const topCategory = categoryBreakdown.length > 0 
    ? { name: categoryBreakdown[0].category, amount: categoryBreakdown[0].amount }
    : null;

  return {
    totalSpent,
    monthlySpent,
    topCategory,
    categoryBreakdown,
  };
};

export const exportToCSV = (expenses: Expense[]): string => {
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const rows = expenses.map(expense => [
    formatDate(expense.date),
    expense.description,
    expense.category,
    expense.amount.toString(),
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
};

export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportToPDF = (expenses: Expense[]): void => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Expense Report', 14, 22);

  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  doc.text(`Total Expenses: ${formatCurrency(totalAmount)}`, 14, 42);

  const tableData = expenses.map(expense => [
    formatDate(expense.date),
    expense.description,
    expense.category,
    formatCurrency(expense.amount)
  ]);

  autoTable(doc, {
    head: [['Date', 'Description', 'Category', 'Amount']],
    body: tableData,
    startY: 50,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30, halign: 'right' },
    },
  });

  const filename = `expenses-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};