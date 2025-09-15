'use client';

import React, { useState } from 'react';
import { Vendor, VendorFilters, ExpenseCategory } from '@/types';
import { formatCurrency, formatDate, downloadCSV, exportVendorsToCSV } from '@/lib/utils';

interface TopVendorsListProps {
  vendors: Vendor[];
  onFiltersChange?: (filters: VendorFilters) => void;
  isLoading?: boolean;
  showFilters?: boolean;
}

export const TopVendorsList: React.FC<TopVendorsListProps> = ({
  vendors,
  onFiltersChange,
  isLoading = false,
  showFilters = true
}) => {
  const [sortBy, setSortBy] = useState<'totalSpent' | 'transactionCount' | 'averageTransaction' | 'name'>('totalSpent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<VendorFilters>({});
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  const categories: (ExpenseCategory | 'All')[] = ['All', 'Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other'];

  const sortedVendors = [...vendors].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'totalSpent':
        aValue = a.totalSpent;
        bValue = b.totalSpent;
        break;
      case 'transactionCount':
        aValue = a.transactionCount;
        bValue = b.transactionCount;
        break;
      case 'averageTransaction':
        aValue = a.averageTransaction;
        bValue = b.averageTransaction;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: 'totalSpent' | 'transactionCount' | 'averageTransaction' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleFilterChange = (newFilters: VendorFilters) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleExportCSV = () => {
    const csvContent = exportVendorsToCSV(sortedVendors);
    const filename = `top-vendors-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Food: 'bg-red-100 text-red-800',
      Transportation: 'bg-blue-100 text-blue-800',
      Entertainment: 'bg-purple-100 text-purple-800',
      Shopping: 'bg-green-100 text-green-800',
      Bills: 'bg-yellow-100 text-yellow-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const toggleVendorExpansion = (vendorName: string) => {
    setExpandedVendor(expandedVendor === vendorName ? null : vendorName);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">🏪</span>
          Top Vendors ({vendors.length})
        </h2>
        <button
          onClick={handleExportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm"
        >
          📊 Export CSV
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category || 'All'}
                onChange={(e) => handleFilterChange({
                  ...filters,
                  category: e.target.value === 'All' ? undefined : e.target.value as ExpenseCategory
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Spent Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Spent
              </label>
              <input
                type="number"
                placeholder="$0"
                min="0"
                step="0.01"
                value={filters.minSpent || ''}
                onChange={(e) => handleFilterChange({
                  ...filters,
                  minSpent: e.target.value ? parseFloat(e.target.value) : undefined
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Max Spent Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Spent
              </label>
              <input
                type="number"
                placeholder="No limit"
                min="0"
                step="0.01"
                value={filters.maxSpent || ''}
                onChange={(e) => handleFilterChange({
                  ...filters,
                  maxSpent: e.target.value ? parseFloat(e.target.value) : undefined
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Vendor
              </label>
              <input
                type="text"
                placeholder="Search vendors..."
                value={filters.searchQuery || ''}
                onChange={(e) => handleFilterChange({
                  ...filters,
                  searchQuery: e.target.value || undefined
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {vendors.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No vendors found</p>
          <p className="text-gray-400 text-sm mt-2">
            {Object.keys(filters).length > 0
              ? 'Try adjusting your filters to see more results'
              : 'Add some expenses to see your vendors'
            }
          </p>
        </div>
      )}

      {/* Desktop Table */}
      {vendors.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Vendor {getSortIcon('name')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalSpent')}
                >
                  Total Spent {getSortIcon('totalSpent')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('transactionCount')}
                >
                  Transactions {getSortIcon('transactionCount')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('averageTransaction')}
                >
                  Avg Amount {getSortIcon('averageTransaction')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedVendors.map((vendor, index) => (
                <React.Fragment key={vendor.name}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(vendor.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vendor.transactionCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(vendor.averageTransaction)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {vendor.categories.slice(0, 2).map(category => (
                          <span
                            key={category}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(category)}`}
                          >
                            {category}
                          </span>
                        ))}
                        {vendor.categories.length > 2 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{vendor.categories.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <p>{formatDate(vendor.firstTransaction)}</p>
                        <p className="text-xs">to {formatDate(vendor.lastTransaction)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleVendorExpansion(vendor.name)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {expandedVendor === vendor.name ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {/* Expanded Row */}
                  {expandedVendor === vendor.name && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-blue-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">All Categories</h4>
                            <div className="space-y-1">
                              {vendor.categories.map(category => (
                                <span
                                  key={category}
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-1 ${getCategoryColor(category)}`}
                                >
                                  {category}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Transaction Period</h4>
                            <p className="text-gray-700">First: {formatDate(vendor.firstTransaction)}</p>
                            <p className="text-gray-700">Latest: {formatDate(vendor.lastTransaction)}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                            <p className="text-gray-700">
                              {vendor.transactionCount} transaction{vendor.transactionCount !== 1 ? 's' : ''}
                            </p>
                            <p className="text-gray-700">
                              Average: {formatCurrency(vendor.averageTransaction)}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards */}
      {vendors.length > 0 && (
        <div className="md:hidden divide-y divide-gray-200">
          {sortedVendors.map((vendor, index) => (
            <div key={vendor.name} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center flex-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                    <p className="text-xs text-gray-600">
                      {vendor.transactionCount} transaction{vendor.transactionCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(vendor.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: {formatCurrency(vendor.averageTransaction)}
                  </p>
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-1 mb-3">
                {vendor.categories.map(category => (
                  <span
                    key={category}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(category)}`}
                  >
                    {category}
                  </span>
                ))}
              </div>

              {/* Period */}
              <div className="text-xs text-gray-500 mb-3">
                {formatDate(vendor.firstTransaction)} - {formatDate(vendor.lastTransaction)}
              </div>

              {/* Expand Button */}
              <div className="text-center">
                <button
                  onClick={() => toggleVendorExpansion(vendor.name)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  {expandedVendor === vendor.name ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedVendor === vendor.name && (
                <div className="mt-3 pt-3 border-t border-gray-200 bg-blue-50 -mx-4 px-4 pb-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Transaction Summary</h4>
                      <p className="text-gray-700">
                        {vendor.transactionCount} transaction{vendor.transactionCount !== 1 ? 's' : ''} • Average: {formatCurrency(vendor.averageTransaction)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Period</h4>
                      <p className="text-gray-700">
                        From {formatDate(vendor.firstTransaction)} to {formatDate(vendor.lastTransaction)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};