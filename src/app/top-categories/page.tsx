'use client';

import Link from 'next/link';
import { useExpenses } from '@/hooks/useExpenses';
import { TopExpenseCategories } from '@/components';
import { ExportButton } from '@/components/ExportButton';

export default function TopCategoriesPage() {
  const { expenses, isLoading } = useExpenses();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📊 Top Expense Categories
              </h1>
              <p className="text-gray-600 mt-1">
                Analyze your spending patterns and identify top categories
              </p>
            </div>
            <div className="flex space-x-3">
              <ExportButton expenses={expenses} />
              <Link
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Main Top Categories Component */}
          <TopExpenseCategories expenses={expenses} isLoading={isLoading} />

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📈 How to Use This Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Understanding the Data</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Categories are ranked by total spending amount</li>
                  <li>• Percentage shows portion of total expenses</li>
                  <li>• Average shows typical expense amount per category</li>
                  <li>• Progress bars provide visual spending comparison</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Time Period Analysis</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>All Time:</strong> Complete spending history</li>
                  <li>• <strong>This Month:</strong> Current month analysis</li>
                  <li>• <strong>Last 30 Days:</strong> Recent spending trends</li>
                  <li>• <strong>Custom:</strong> Specific date range analysis</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Pro Tips</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Use different time periods to identify seasonal spending patterns</p>
                <p>• Focus on your top 3 categories for the biggest budget impact</p>
                <p>• Compare current month vs. historical average to track improvements</p>
                <p>• Export data to analyze trends in your preferred spreadsheet application</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}