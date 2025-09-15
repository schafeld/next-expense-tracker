'use client';

import { Expense } from '@/types';
import { exportToCSV, downloadCSV, exportToPDF } from '@/lib/utils';

interface ExportButtonProps {
  expenses: Expense[];
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  expenses,
  disabled = false
}) => {
  const handleCSVExport = () => {
    if (expenses.length === 0) {
      alert('No expenses to export');
      return;
    }

    const csvContent = exportToCSV(expenses);
    const filename = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  const handlePDFExport = () => {
    if (expenses.length === 0) {
      alert('No expenses to export');
      return;
    }

    exportToPDF(expenses);
  };

  const isDisabled = disabled || expenses.length === 0;
  const buttonClasses = "px-4 py-2 rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white";

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCSVExport}
        disabled={isDisabled}
        className={`${buttonClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500`}
        title={expenses.length === 0 ? 'No expenses to export' : 'Export to CSV'}
      >
        📊 Export CSV
      </button>
      <button
        onClick={handlePDFExport}
        disabled={isDisabled}
        className={`${buttonClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`}
        title={expenses.length === 0 ? 'No expenses to export' : 'Export to PDF'}
      >
        📄 Export PDF
      </button>
    </div>
  );
};