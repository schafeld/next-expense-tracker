'use client';

import { useState, useMemo } from 'react';
import { Expense } from '@/types';
import { formatCurrency, calculateTopExpenseCategoriesWithTimeRange } from '@/lib/utils';

interface TopExpenseCategoriesProps {
  expenses: Expense[];
  isLoading?: boolean;
}

const categoryIcons: Record<string, string> = {
  'Food': '🍽️',
  'Transportation': '🚗',
  'Entertainment': '🎬',
  'Shopping': '🛒',
  'Bills': '🧾',
  'Other': '📦',
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'Food': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  'Transportation': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  'Entertainment': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  'Shopping': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
  'Bills': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  'Other': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
};

export const TopExpenseCategories: React.FC<TopExpenseCategoriesProps> = ({
  expenses,
  isLoading = false
}) => {
  type PeriodType = 'all' | 'current-month' | 'last-30-days' | 'custom';
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const topCategories = useMemo(() => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    switch (selectedPeriod) {
      case 'current-month': {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      }
      case 'last-30-days': {
        const now = new Date();
        endDate = now.toISOString().split('T')[0];
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      }
      case 'custom': {
        startDate = customStartDate || undefined;
        endDate = customEndDate || undefined;
        break;
      }
      default:
        // 'all' - no date filtering
        break;
    }

    return calculateTopExpenseCategoriesWithTimeRange(expenses, startDate, endDate);
  }, [expenses, selectedPeriod, customStartDate, customEndDate]);

  const totalAmount = useMemo(() => {
    return topCategories.reduce((sum, category) => sum + category.totalAmount, 0);
  }, [topCategories]);

  const totalExpenses = useMemo(() => {
    return topCategories.reduce((sum, category) => sum + category.expenseCount, 0);
  }, [topCategories]);

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'current-month':
        return 'This Month';
      case 'last-30-days':
        return 'Last 30 Days';
      case 'custom':
        return 'Custom Period';
      default:
        return 'All Time';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📊 Top Expense Categories
        </h2>
        <p className="text-gray-600 mb-4">
          Analyze your spending patterns by category
        </p>

        {/* Period Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {(['all', 'current-month', 'last-30-days', 'custom'] as PeriodType[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === 'all' && 'All Time'}
                {period === 'current-month' && 'This Month'}
                {period === 'last-30-days' && 'Last 30 Days'}
                {period === 'custom' && 'Custom'}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          {selectedPeriod === 'custom' && (
            <div className="flex flex-wrap gap-4 mt-3">
              <div>
                <label htmlFor="custom-start-date" className="block text-xs text-gray-600 mb-1">Start Date</label>
                <input
                  id="custom-start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="custom-end-date" className="block text-xs text-gray-600 mb-1">End Date</label>
                <input
                  id="custom-end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">{getPeriodLabel()} Total</p>
            <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Expenses</p>
            <p className="text-2xl font-bold text-green-800">{totalExpenses}</p>
          </div>
        </div>
      </div>

      {/* Categories List */}
      {topCategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Expenses Found</h3>
          <p className="text-gray-600">
            {selectedPeriod === 'custom' && !customStartDate && !customEndDate
              ? 'Please select a date range to view expense categories.'
              : 'No expenses found for the selected period.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {topCategories.map((category, index) => {
            const colors = categoryColors[category.category] || categoryColors['Other'];
            const icon = categoryIcons[category.category] || categoryIcons['Other'];

            return (
              <div
                key={category.category}
                className={`p-4 rounded-lg border ${colors.bg} ${colors.border} transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{icon}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-lg font-semibold ${colors.text}`}>
                          #{index + 1} {category.category}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
                          {category.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {category.expenseCount} expense{category.expenseCount !== 1 ? 's' : ''} •
                        Avg: {formatCurrency(category.averageExpenseAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${colors.text}`}>
                      {formatCurrency(category.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${colors.text.replace('text-', 'bg-')}`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Additional Insights */}
      {topCategories.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 mb-2">💡 Quick Insights</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Your top category accounts for {topCategories[0]?.percentage.toFixed(1)}% of total spending</p>
            {topCategories.length > 1 && (
              <p>• Top 3 categories represent {topCategories.slice(0, 3).reduce((sum, cat) => sum + cat.percentage, 0).toFixed(1)}% of your expenses</p>
            )}
            <p>• Average expense amount across all categories: {formatCurrency(totalAmount / totalExpenses)}</p>
          </div>
        </div>
      )}
    </div>
  );
};