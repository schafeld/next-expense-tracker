'use client';

import { Expense } from '@/types';
import { exportToCSV, downloadCSV } from '@/lib/utils';

interface ExportButtonProps {
  expenses: Expense[];
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  expenses,
  disabled = false
}) => {
  const handleExport = () => {
    if (expenses.length === 0) {
      alert('No expenses to export');
      return;
    }

    const csvContent = exportToCSV(expenses);
    const filename = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || expenses.length === 0}
      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title={expenses.length === 0 ? 'No expenses to export' : 'Export to CSV'}
    >
      📊 Export CSV
    </button>
  );
};