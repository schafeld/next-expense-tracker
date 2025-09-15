import {
  extractVendorName,
  getVendorName,
  groupExpensesByVendor,
  filterVendors,
  calculateVendorSummary,
  generateVendorChartData,
  getVendorTrends,
  exportVendorsToCSV,
} from '@/lib/vendorUtils';
import { Expense, Vendor, VendorFilters } from '@/types';

// Mock expense data for testing
const mockExpenses: Expense[] = [
  {
    id: '1',
    amount: 25.50,
    description: 'Lunch at McDonald\'s',
    category: 'Food',
    date: '2024-01-15',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: '2',
    amount: 45.00,
    description: 'Gas from Shell',
    category: 'Transportation',
    date: '2024-01-16',
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
  },
  {
    id: '3',
    amount: 15.75,
    description: 'Coffee at Starbucks',
    category: 'Food',
    date: '2024-01-17',
    createdAt: '2024-01-17T09:00:00Z',
    updatedAt: '2024-01-17T09:00:00Z',
  },
  {
    id: '4',
    amount: 30.25,
    description: 'McDonald\'s - Dinner',
    category: 'Food',
    date: '2024-01-18',
    createdAt: '2024-01-18T19:00:00Z',
    updatedAt: '2024-01-18T19:00:00Z',
  },
  {
    id: '5',
    amount: 100.00,
    description: 'Amazon',
    category: 'Shopping',
    date: '2024-01-19',
    createdAt: '2024-01-19T14:00:00Z',
    updatedAt: '2024-01-19T14:00:00Z',
  },
];

describe('vendorUtils', () => {
  describe('extractVendorName', () => {
    it('should extract vendor from "at" pattern', () => {
      expect(extractVendorName('Lunch at McDonald\'s')).toBe('McDonald\'s');
      expect(extractVendorName('Coffee at Starbucks')).toBe('Starbucks');
    });

    it('should extract vendor from "from" pattern', () => {
      expect(extractVendorName('Gas from Shell')).toBe('Shell');
      expect(extractVendorName('Purchase from Amazon')).toBe('Amazon');
    });

    it('should extract vendor from dash pattern', () => {
      expect(extractVendorName('McDonald\'s - Dinner')).toBe('McDonald\'s');
      expect(extractVendorName('Walmart - Groceries')).toBe('Walmart');
    });

    it('should return description as-is for short descriptions', () => {
      expect(extractVendorName('Amazon')).toBe('Amazon');
      expect(extractVendorName('Starbucks')).toBe('Starbucks');
    });

    it('should take first few words for generic descriptions', () => {
      expect(extractVendorName('Generic grocery store purchase')).toBe('Generic grocery store');
      expect(extractVendorName('Random long description with many words')).toBe('Random long description');
    });
  });

  describe('getVendorName', () => {
    it('should use vendor field when available', () => {
      const expense: Expense = {
        id: '1',
        amount: 25.50,
        description: 'Lunch at Old Restaurant',
        category: 'Food',
        date: '2024-01-15',
        vendor: 'McDonald\'s',
        createdAt: '2024-01-15T12:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
      };

      expect(getVendorName(expense)).toBe('McDonald\'s');
    });

    it('should fallback to description extraction when vendor field is empty', () => {
      const expense: Expense = {
        id: '1',
        amount: 25.50,
        description: 'Lunch at McDonald\'s',
        category: 'Food',
        date: '2024-01-15',
        vendor: '',
        createdAt: '2024-01-15T12:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
      };

      expect(getVendorName(expense)).toBe('McDonald\'s');
    });

    it('should fallback to description extraction when vendor field is undefined', () => {
      const expense: Expense = {
        id: '1',
        amount: 25.50,
        description: 'Lunch at McDonald\'s',
        category: 'Food',
        date: '2024-01-15',
        createdAt: '2024-01-15T12:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
      };

      expect(getVendorName(expense)).toBe('McDonald\'s');
    });

    it('should trim whitespace from vendor field', () => {
      const expense: Expense = {
        id: '1',
        amount: 25.50,
        description: 'Lunch at Old Restaurant',
        category: 'Food',
        date: '2024-01-15',
        vendor: '  McDonald\'s  ',
        createdAt: '2024-01-15T12:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
      };

      expect(getVendorName(expense)).toBe('McDonald\'s');
    });

    it('should prefer vendor field over description extraction', () => {
      const expense: Expense = {
        id: '1',
        amount: 25.50,
        description: 'Lunch at Burger King',  // This would extract "Burger King"
        category: 'Food',
        date: '2024-01-15',
        vendor: 'McDonald\'s',  // But vendor field should take precedence
        createdAt: '2024-01-15T12:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
      };

      expect(getVendorName(expense)).toBe('McDonald\'s');
    });
  });

  describe('groupExpensesByVendor', () => {
    it('should group expenses by vendor correctly', () => {
      const vendors = groupExpensesByVendor(mockExpenses);

      expect(vendors).toHaveLength(4); // McDonald's, Shell, Starbucks, Amazon

      const mcdonalds = vendors.find(v => v.name === 'McDonald\'s');
      expect(mcdonalds).toBeTruthy();
      expect(mcdonalds!.totalSpent).toBe(55.75); // 25.50 + 30.25
      expect(mcdonalds!.transactionCount).toBe(2);
      expect(mcdonalds!.categories).toContain('Food');

      const amazon = vendors.find(v => v.name === 'Amazon');
      expect(amazon).toBeTruthy();
      expect(amazon!.totalSpent).toBe(100.00);
      expect(amazon!.transactionCount).toBe(1);
      expect(amazon!.categories).toContain('Shopping');
    });

    it('should sort vendors by total spent (descending)', () => {
      const vendors = groupExpensesByVendor(mockExpenses);

      expect(vendors[0].name).toBe('Amazon'); // $100
      expect(vendors[1].name).toBe('McDonald\'s'); // $55.75
      expect(vendors[2].name).toBe('Shell'); // $45
      expect(vendors[3].name).toBe('Starbucks'); // $15.75
    });

    it('should calculate average transaction correctly', () => {
      const vendors = groupExpensesByVendor(mockExpenses);
      const mcdonalds = vendors.find(v => v.name === 'McDonald\'s');

      expect(mcdonalds!.averageTransaction).toBeCloseTo(27.875); // (25.50 + 30.25) / 2
    });
  });

  describe('filterVendors', () => {
    let vendors: Vendor[];

    beforeEach(() => {
      vendors = groupExpensesByVendor(mockExpenses);
    });

    it('should filter by category', () => {
      const filters: VendorFilters = { category: 'Food' };
      const filtered = filterVendors(vendors, filters);

      expect(filtered).toHaveLength(2); // McDonald's and Starbucks
      expect(filtered.some(v => v.name === 'McDonald\'s')).toBe(true);
      expect(filtered.some(v => v.name === 'Starbucks')).toBe(true);
    });

    it('should filter by minimum spent', () => {
      const filters: VendorFilters = { minSpent: 50 };
      const filtered = filterVendors(vendors, filters);

      expect(filtered).toHaveLength(2); // Amazon ($100) and McDonald's ($55.75)
    });

    it('should filter by maximum spent', () => {
      const filters: VendorFilters = { maxSpent: 50 };
      const filtered = filterVendors(vendors, filters);

      expect(filtered).toHaveLength(2); // Shell ($45) and Starbucks ($15.75)
    });

    it('should filter by search query', () => {
      const filters: VendorFilters = { searchQuery: 'mc' };
      const filtered = filterVendors(vendors, filters);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('McDonald\'s');
    });

    it('should apply multiple filters', () => {
      const filters: VendorFilters = {
        category: 'Food',
        minSpent: 20
      };
      const filtered = filterVendors(vendors, filters);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('McDonald\'s');
    });
  });

  describe('calculateVendorSummary', () => {
    it('should calculate summary correctly', () => {
      const vendors = groupExpensesByVendor(mockExpenses);
      const summary = calculateVendorSummary(vendors);

      expect(summary.totalVendors).toBe(4);
      expect(summary.totalSpent).toBe(216.5); // Sum of all expenses
      expect(summary.averageSpentPerVendor).toBeCloseTo(54.125); // 216.5 / 4
      expect(summary.topVendors).toHaveLength(4); // All vendors since < 10
      expect(summary.topVendors[0].name).toBe('Amazon'); // Highest spender
    });

    it('should limit top vendors to 10', () => {
      // Create more vendors for testing
      const manyExpenses: Expense[] = [];
      for (let i = 0; i < 15; i++) {
        manyExpenses.push({
          id: `${i}`,
          amount: 10 + i,
          description: `Vendor ${i}`,
          category: 'Other',
          date: '2024-01-15',
          createdAt: '2024-01-15T12:00:00Z',
          updatedAt: '2024-01-15T12:00:00Z',
        });
      }

      const vendors = groupExpensesByVendor(manyExpenses);
      const summary = calculateVendorSummary(vendors);

      expect(summary.totalVendors).toBe(15);
      expect(summary.topVendors).toHaveLength(10); // Limited to 10
    });
  });

  describe('generateVendorChartData', () => {
    it('should generate chart data correctly', () => {
      const vendors = groupExpensesByVendor(mockExpenses);
      const chartData = generateVendorChartData(vendors, 3);

      expect(chartData).toHaveLength(3); // Limited to 3
      expect(chartData[0].name).toBe('Amazon');
      expect(chartData[0].amount).toBe(100);
      expect(chartData[0].percentage).toBeCloseTo(46.189); // 100/216.5 * 100
      expect(chartData[0].color).toBe('#3B82F6');
    });

    it('should assign different colors to vendors', () => {
      const vendors = groupExpensesByVendor(mockExpenses);
      const chartData = generateVendorChartData(vendors);

      const colors = chartData.map(d => d.color);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBeGreaterThan(1); // Should have different colors
    });
  });

  describe('exportVendorsToCSV', () => {
    it('should export vendors to CSV format', () => {
      const vendors = groupExpensesByVendor(mockExpenses);
      const csv = exportVendorsToCSV(vendors);

      expect(csv).toContain('Vendor Name');
      expect(csv).toContain('Total Spent');
      expect(csv).toContain('Transaction Count');
      expect(csv).toContain('Amazon');
      expect(csv).toContain('100.00');
      expect(csv).toContain('McDonald\'s');
      expect(csv).toContain('55.75');
    });

    it('should handle empty vendor list', () => {
      const csv = exportVendorsToCSV([]);

      expect(csv).toContain('Vendor Name'); // Should still have headers
      const lines = csv.split('\n');
      expect(lines).toHaveLength(1); // Only header row
    });
  });

  describe('mixed data scenarios', () => {
    // Test data with mixed vendor field usage
    const mixedExpenses: Expense[] = [
      {
        id: '1',
        amount: 25.50,
        description: 'Lunch meal',
        category: 'Food',
        date: '2024-01-15',
        vendor: 'McDonald\'s', // Uses vendor field
        createdAt: '2024-01-15T12:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
      },
      {
        id: '2',
        amount: 45.00,
        description: 'Gas from Shell', // No vendor field, will extract from description
        category: 'Transportation',
        date: '2024-01-16',
        createdAt: '2024-01-16T08:00:00Z',
        updatedAt: '2024-01-16T08:00:00Z',
      },
      {
        id: '3',
        amount: 15.75,
        description: 'Morning coffee purchase',
        category: 'Food',
        date: '2024-01-17',
        vendor: 'Starbucks', // Uses vendor field
        createdAt: '2024-01-17T09:00:00Z',
        updatedAt: '2024-01-17T09:00:00Z',
      },
      {
        id: '4',
        amount: 30.25,
        description: 'Second meal at McDonald\'s', // No vendor field, will extract "McDonald's"
        category: 'Food',
        date: '2024-02-18', // Different month
        createdAt: '2024-02-18T19:00:00Z',
        updatedAt: '2024-02-18T19:00:00Z',
      },
      {
        id: '5',
        amount: 100.00,
        description: 'Online purchase',
        category: 'Shopping',
        date: '2024-01-19',
        vendor: 'Amazon', // Uses vendor field
        createdAt: '2024-01-19T14:00:00Z',
        updatedAt: '2024-01-19T14:00:00Z',
      },
    ];

    it('should handle expenses with and without vendor field correctly', () => {
      const vendors = groupExpensesByVendor(mixedExpenses);

      expect(vendors).toHaveLength(4); // McDonald's, Shell, Starbucks, Amazon

      // McDonald's should have 2 transactions (one from vendor field, one from description)
      const mcdonalds = vendors.find(v => v.name === 'McDonald\'s');
      expect(mcdonalds).toBeTruthy();
      expect(mcdonalds!.totalSpent).toBe(55.75); // 25.50 + 30.25
      expect(mcdonalds!.transactionCount).toBe(2);

      // Shell should work from description extraction
      const shell = vendors.find(v => v.name === 'Shell');
      expect(shell).toBeTruthy();
      expect(shell!.totalSpent).toBe(45.00);
      expect(shell!.transactionCount).toBe(1);

      // Starbucks should work from vendor field
      const starbucks = vendors.find(v => v.name === 'Starbucks');
      expect(starbucks).toBeTruthy();
      expect(starbucks!.totalSpent).toBe(15.75);
      expect(starbucks!.transactionCount).toBe(1);

      // Amazon should work from vendor field
      const amazon = vendors.find(v => v.name === 'Amazon');
      expect(amazon).toBeTruthy();
      expect(amazon!.totalSpent).toBe(100.00);
      expect(amazon!.transactionCount).toBe(1);
    });

    it('should prioritize vendor field over description extraction when both are present', () => {
      const conflictExpenses: Expense[] = [
        {
          id: '1',
          amount: 25.50,
          description: 'Lunch at Burger King', // Would extract "Burger King"
          category: 'Food',
          date: '2024-01-15',
          vendor: 'McDonald\'s', // But should use this instead
          createdAt: '2024-01-15T12:00:00Z',
          updatedAt: '2024-01-15T12:00:00Z',
        },
      ];

      const vendors = groupExpensesByVendor(conflictExpenses);
      expect(vendors).toHaveLength(1);
      expect(vendors[0].name).toBe('McDonald\'s');
    });

    it('should handle empty vendor field by falling back to description', () => {
      const emptyVendorExpenses: Expense[] = [
        {
          id: '1',
          amount: 25.50,
          description: 'Coffee at Starbucks',
          category: 'Food',
          date: '2024-01-15',
          vendor: '', // Empty string
          createdAt: '2024-01-15T12:00:00Z',
          updatedAt: '2024-01-15T12:00:00Z',
        },
        {
          id: '2',
          amount: 45.00,
          description: 'Gas from Shell',
          category: 'Transportation',
          date: '2024-01-16',
          vendor: '   ', // Only whitespace
          createdAt: '2024-01-16T08:00:00Z',
          updatedAt: '2024-01-16T08:00:00Z',
        },
      ];

      const vendors = groupExpensesByVendor(emptyVendorExpenses);
      expect(vendors).toHaveLength(2);
      expect(vendors.find(v => v.name === 'Starbucks')).toBeTruthy();
      expect(vendors.find(v => v.name === 'Shell')).toBeTruthy();
    });

    it('should properly calculate vendor trends with mixed data', () => {
      const trends = getVendorTrends(mixedExpenses, 'McDonald\'s');

      expect(trends.total).toBe(55.75); // Sum of both McDonald's transactions
      expect(trends.monthly).toHaveLength(2); // Two different months
    });

    it('should handle CSV export with mixed data', () => {
      const vendors = groupExpensesByVendor(mixedExpenses);
      const csv = exportVendorsToCSV(vendors);

      expect(csv).toContain('McDonald\'s');
      expect(csv).toContain('Shell');
      expect(csv).toContain('Starbucks');
      expect(csv).toContain('Amazon');
      expect(csv).toContain('55.75'); // McDonald's total
    });
  });
});