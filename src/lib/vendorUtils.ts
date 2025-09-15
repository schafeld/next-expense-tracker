import { Expense, Vendor, VendorSummary, VendorFilters, VendorChartData } from '@/types';

/**
 * Extract vendor name from expense description
 * This function attempts to extract meaningful vendor names from descriptions
 * Used as fallback when no vendor field is provided
 */
export const extractVendorName = (description: string): string => {
  // Clean up the description and extract potential vendor name
  const cleaned = description.trim();

  // If description is short and doesn't contain patterns, return as is
  if (cleaned.length <= 25 && !cleaned.includes(' at ') && !cleaned.includes(' from ') && !cleaned.includes(' - ')) {
    return cleaned;
  }

  // Try to extract from patterns like "Lunch at McDonald's" or "Gas from Shell"
  const atMatch = cleaned.match(/(.+?)\s+at\s+(.+)/i);
  if (atMatch) {
    return atMatch[2];
  }

  const fromMatch = cleaned.match(/(.+?)\s+from\s+(.+)/i);
  if (fromMatch) {
    return fromMatch[2];
  }

  // Try to extract from patterns like "McDonald's - Lunch"
  const dashMatch = cleaned.match(/^([^-]+)\s*-\s*(.+)$/);
  if (dashMatch && dashMatch[1].trim().length > 0) {
    return dashMatch[1].trim();
  }

  // For generic descriptions, take first few words as vendor name
  const words = cleaned.split(' ');
  if (words.length <= 3) {
    return cleaned;
  }

  // Take first 2-3 words as vendor name for longer descriptions
  return words.slice(0, Math.min(3, words.length)).join(' ');
};

/**
 * Get vendor name from expense, using vendor field if available, otherwise extracting from description
 * This function provides backward compatibility and handles mixed data scenarios
 */
export const getVendorName = (expense: Expense): string => {
  // Use dedicated vendor field if available and not empty
  if (expense.vendor && expense.vendor.trim()) {
    return expense.vendor.trim();
  }

  // Fall back to extracting from description for backward compatibility
  return extractVendorName(expense.description);
};

/**
 * Group expenses by vendor and calculate vendor statistics
 */
export const groupExpensesByVendor = (expenses: Expense[]): Vendor[] => {
  const vendorMap = new Map<string, {
    expenses: Expense[];
    totalSpent: number;
    categories: Set<string>;
  }>();

  // Group expenses by vendor
  expenses.forEach(expense => {
    const vendorName = getVendorName(expense);

    if (!vendorMap.has(vendorName)) {
      vendorMap.set(vendorName, {
        expenses: [],
        totalSpent: 0,
        categories: new Set(),
      });
    }

    const vendor = vendorMap.get(vendorName)!;
    vendor.expenses.push(expense);
    vendor.totalSpent += expense.amount;
    vendor.categories.add(expense.category);
  });

  // Convert to Vendor objects
  const vendors: Vendor[] = [];

  vendorMap.forEach((vendorData, vendorName) => {
    const sortedExpenses = vendorData.expenses.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    vendors.push({
      name: vendorName,
      totalSpent: vendorData.totalSpent,
      transactionCount: vendorData.expenses.length,
      categories: Array.from(vendorData.categories) as Expense['category'][],
      averageTransaction: vendorData.totalSpent / vendorData.expenses.length,
      firstTransaction: sortedExpenses[0].date,
      lastTransaction: sortedExpenses[sortedExpenses.length - 1].date,
    });
  });

  return vendors.sort((a, b) => b.totalSpent - a.totalSpent);
};

/**
 * Filter vendors based on provided filters
 */
export const filterVendors = (vendors: Vendor[], filters: VendorFilters): Vendor[] => {
  return vendors.filter(vendor => {
    // Category filter
    if (filters.category && filters.category !== 'All') {
      if (!vendor.categories.includes(filters.category)) {
        return false;
      }
    }

    // Spending range filter
    if (filters.minSpent !== undefined && vendor.totalSpent < filters.minSpent) {
      return false;
    }

    if (filters.maxSpent !== undefined && vendor.totalSpent > filters.maxSpent) {
      return false;
    }

    // Date range filter
    if (filters.startDate && vendor.lastTransaction < filters.startDate) {
      return false;
    }

    if (filters.endDate && vendor.firstTransaction > filters.endDate) {
      return false;
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (!vendor.name.toLowerCase().includes(query)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Calculate vendor summary statistics
 */
export const calculateVendorSummary = (vendors: Vendor[]): VendorSummary => {
  const totalSpent = vendors.reduce((sum, vendor) => sum + vendor.totalSpent, 0);
  const topVendors = vendors.slice(0, 10); // Top 10 vendors

  return {
    topVendors,
    totalVendors: vendors.length,
    totalSpent,
    averageSpentPerVendor: vendors.length > 0 ? totalSpent / vendors.length : 0,
  };
};

/**
 * Generate chart data for vendor visualization
 */
export const generateVendorChartData = (vendors: Vendor[], limit = 10): VendorChartData[] => {
  const topVendors = vendors.slice(0, limit);
  const totalSpent = vendors.reduce((sum, vendor) => sum + vendor.totalSpent, 0);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
  ];

  return topVendors.map((vendor, index) => ({
    name: vendor.name,
    amount: vendor.totalSpent,
    percentage: totalSpent > 0 ? (vendor.totalSpent / totalSpent) * 100 : 0,
    color: colors[index % colors.length],
  }));
};

/**
 * Get vendor spending trends over time
 */
export const getVendorTrends = (expenses: Expense[], vendorName: string): {
  monthly: Array<{ month: string; amount: number }>;
  total: number;
} => {
  const vendorExpenses = expenses.filter(expense =>
    getVendorName(expense) === vendorName
  );

  const monthlyData = new Map<string, number>();
  let total = 0;

  vendorExpenses.forEach(expense => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + expense.amount);
    total += expense.amount;
  });

  const monthly = Array.from(monthlyData.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return { monthly, total };
};

/**
 * Export vendor data to CSV format
 */
export const exportVendorsToCSV = (vendors: Vendor[]): string => {
  const headers = [
    'Vendor Name',
    'Total Spent',
    'Transaction Count',
    'Average Transaction',
    'Categories',
    'First Transaction',
    'Last Transaction'
  ];

  const rows = vendors.map(vendor => [
    vendor.name,
    vendor.totalSpent.toFixed(2),
    vendor.transactionCount.toString(),
    vendor.averageTransaction.toFixed(2),
    vendor.categories.join(', '),
    vendor.firstTransaction,
    vendor.lastTransaction,
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
};