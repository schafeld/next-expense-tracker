'use client';

import { useState } from 'react';
import { Vendor } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface TopVendorsCardProps {
  vendors: Vendor[];
  isLoading?: boolean;
  limit?: number;
}

export const TopVendorsCard: React.FC<TopVendorsCardProps> = ({
  vendors,
  isLoading = false,
  limit = 5
}) => {
  const [showAll, setShowAll] = useState(false);

  const displayedVendors = showAll ? vendors : vendors.slice(0, limit);
  const topVendor = vendors.length > 0 ? vendors[0] : null;
  const totalSpent = vendors.reduce((sum, vendor) => sum + vendor.totalSpent, 0);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">No vendors found</p>
        <p className="text-gray-400 text-sm mt-2">
          Add some expenses to see your top vendors
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">🏪</span>
          Top Vendors
        </h3>
        {topVendor && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Top Vendor</p>
            <p className="font-semibold text-green-600">{topVendor.name}</p>
          </div>
        )}
      </div>

      {/* Vendor List */}
      <div className="space-y-3">
        {displayedVendors.map((vendor, index) => (
          <div
            key={vendor.name}
            className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-semibold mr-3">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{vendor.name}</p>
                <p className="text-xs text-gray-600">
                  {vendor.transactionCount} transaction{vendor.transactionCount !== 1 ? 's' : ''} •
                  Avg: {formatCurrency(vendor.averageTransaction)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatCurrency(vendor.totalSpent)}
              </p>
              <p className="text-xs text-gray-500">
                {totalSpent > 0 ? ((vendor.totalSpent / totalSpent) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {vendors.length > limit && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            {showAll ? `Show Less` : `Show All (${vendors.length})`}
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {vendors.length}
            </p>
            <p className="text-sm text-gray-600">Total Vendors</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
        </div>
      </div>
    </div>
  );
};