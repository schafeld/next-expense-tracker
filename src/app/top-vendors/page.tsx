'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useExpenses } from '@/hooks/useExpenses';
import { TopVendorsList } from '@/components/TopVendorsList';
import { TopVendorsCard } from '@/components/TopVendorsCard';
import { VendorFilters, VendorChartData } from '@/types';
import {
  groupExpensesByVendor,
  filterVendors,
  calculateVendorSummary,
  generateVendorChartData,
} from '@/lib/vendorUtils';
import { formatCurrency } from '@/lib/utils';

export default function TopVendorsPage() {
  const { expenses, isLoading } = useExpenses();
  const [filters, setFilters] = useState<VendorFilters>({});

  // Process expenses into vendor data
  const allVendors = useMemo(() => {
    return groupExpensesByVendor(expenses);
  }, [expenses]);

  // Apply filters
  const filteredVendors = useMemo(() => {
    return filterVendors(allVendors, filters);
  }, [allVendors, filters]);

  // Calculate summary data
  const vendorSummary = useMemo(() => {
    return calculateVendorSummary(filteredVendors);
  }, [filteredVendors]);

  // Generate chart data for visualization
  const chartData = useMemo(() => {
    return generateVendorChartData(filteredVendors, 10);
  }, [filteredVendors]);

  const VendorChart: React.FC<{ data: VendorChartData[] }> = ({ data }) => {
    if (data.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">No data to display</p>
        </div>
      );
    }

    const maxAmount = Math.max(...data.map(d => d.amount));

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Vendor Spending Distribution
        </h3>
        <div className="space-y-3">
          {data.map((vendor) => (
            <div key={vendor.name} className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: vendor.color }} />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate mr-2">
                    {vendor.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatCurrency(vendor.amount)} ({vendor.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: vendor.color,
                      width: `${(vendor.amount / maxAmount) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <Link
                  href="/"
                  className="hover:text-gray-700 transition-colors"
                >
                  💰 Expense Tracker
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">Top Vendors</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">
                🏪 Top Vendors Analysis
              </h1>
              <p className="text-gray-600 mt-1">
                Discover your spending patterns by vendor
              </p>
            </div>
            <Link
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Vendors</p>
                <p className="text-2xl font-bold text-blue-600">{vendorSummary.totalVendors}</p>
              </div>
              <div className="text-3xl text-blue-500 ml-4">🏪</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(vendorSummary.totalSpent)}
                </p>
              </div>
              <div className="text-3xl text-green-500 ml-4">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Average per Vendor</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(vendorSummary.averageSpentPerVendor)}
                </p>
              </div>
              <div className="text-3xl text-purple-500 ml-4">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Top Vendor</p>
                <p className="text-lg font-bold text-yellow-600">
                  {vendorSummary.topVendors[0]?.name || 'None'}
                </p>
                {vendorSummary.topVendors[0] && (
                  <p className="text-sm text-gray-600">
                    {formatCurrency(vendorSummary.topVendors[0].totalSpent)}
                  </p>
                )}
              </div>
              <div className="text-3xl text-yellow-500 ml-4">🏆</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <TopVendorsList
              vendors={filteredVendors}
              onFiltersChange={setFilters}
              isLoading={isLoading}
              showFilters={true}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <TopVendorsCard
              vendors={filteredVendors}
              isLoading={isLoading}
              limit={10}
            />
            <VendorChart data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
}