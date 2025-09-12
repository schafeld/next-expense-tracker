'use client';

import { ExpenseSummary } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface CategoryChartProps {
  summary: ExpenseSummary;
  isLoading?: boolean;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  summary,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (summary.categoryBreakdown.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Spending by Category
        </h3>
        <p className="text-gray-500">No expense data available</p>
      </div>
    );
  }

  const getCategoryColor = (category: string, index: number): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Spending by Category
      </h3>
      
      <div className="space-y-4">
        {summary.categoryBreakdown.map((item, index) => (
          <div key={item.category} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">
                {item.category}
              </span>
              <span className="text-gray-600">
                {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getCategoryColor(item.category, index)} transition-all duration-500`}
                style={{ width: `${Math.max(item.percentage, 2)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span className="text-gray-900">Total Spent</span>
          <span className="text-gray-900">{formatCurrency(summary.totalSpent)}</span>
        </div>
      </div>
    </div>
  );
};