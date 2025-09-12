'use client';

import { useState, useEffect } from 'react';
import { Expense, ExpenseCategory } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { exportUtilsV2 } from '@/lib/exportUtilsV2';

interface ExportFilters {
  startDate: string;
  endDate: string;
  categories: ExpenseCategory[];
}

interface AdvancedExportModalProps {
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
}

export type ExportFormat = 'csv' | 'json' | 'pdf';

export const AdvancedExportModal: React.FC<AdvancedExportModalProps> = ({
  expenses,
  isOpen,
  onClose,
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState('');
  const [filters, setFilters] = useState<ExportFilters>({
    startDate: '',
    endDate: '',
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

  const allCategories: ExpenseCategory[] = [
    'Food',
    'Transportation', 
    'Entertainment',
    'Shopping',
    'Bills',
    'Other'
  ];

  // Generate default filename based on current date and format
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFilename(`expenses-${today}.${format}`);
  }, [format]);

  // Filter expenses based on current filters
  useEffect(() => {
    let filtered = expenses;

    // Date range filtering
    if (filters.startDate) {
      filtered = filtered.filter(expense => expense.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(expense => expense.date <= filters.endDate);
    }

    // Category filtering
    if (filters.categories.length > 0) {
      filtered = filtered.filter(expense => 
        filters.categories.includes(expense.category)
      );
    }

    setFilteredExpenses(filtered);
  }, [expenses, filters]);

  const handleCategoryToggle = (category: ExpenseCategory) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSelectAllCategories = () => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.length === allCategories.length ? [] : allCategories
    }));
  };

  const handleExport = async () => {
    if (filteredExpenses.length === 0) {
      alert('No expenses match the selected filters');
      return;
    }

    setIsLoading(true);
    try {
      await exportUtilsV2.exportData(filteredExpenses, format, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            🚀 Advanced Data Export
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['csv', 'json', 'pdf'] as ExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    format === fmt
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <div className="text-lg mb-1">
                    {fmt === 'csv' && '📊'}
                    {fmt === 'json' && '📋'}
                    {fmt === 'pdf' && '📄'}
                  </div>
                  <div className="font-medium uppercase">{fmt}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {fmt === 'csv' && 'Spreadsheet format'}
                    {fmt === 'json' && 'Data interchange'}
                    {fmt === 'pdf' && 'Professional report'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Date Range (optional)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Categories (optional)
              </label>
              <button
                onClick={handleSelectAllCategories}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={isLoading}
              >
                {filters.categories.length === allCategories.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {allCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded text-blue-600"
                    disabled={isLoading}
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Filename */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter filename..."
              disabled={isLoading}
            />
          </div>

          {/* Export Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Export Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Records to export:</span>
                <span className="ml-2 font-semibold text-blue-600">
                  {filteredExpenses.length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total value:</span>
                <span className="ml-2 font-semibold text-green-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Preview Toggle */}
          <div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              disabled={isLoading || filteredExpenses.length === 0}
            >
              {showPreview ? '▼ Hide Preview' : '▶ Show Data Preview'}
            </button>
          </div>

          {/* Data Preview */}
          {showPreview && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b">
                <h4 className="font-semibold text-gray-900">
                  Data Preview ({filteredExpenses.length} records)
                </h4>
              </div>
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredExpenses.slice(0, 10).map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">{formatDate(expense.date)}</td>
                        <td className="px-3 py-2">{expense.description}</td>
                        <td className="px-3 py-2">{expense.category}</td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredExpenses.length > 10 && (
                  <div className="p-3 bg-gray-50 text-center text-sm text-gray-600">
                    ... and {filteredExpenses.length - 10} more records
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isLoading || filteredExpenses.length === 0 || !filename.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Export Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};