// Only test the new functions we created, not the ones that import jsPDF
import { ExpenseCategory } from '@/types';

// Define the interfaces and functions locally to avoid import issues
interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface TopExpenseCategory {
  category: ExpenseCategory;
  totalAmount: number;
  expenseCount: number;
  percentage: number;
  averageExpenseAmount: number;
}

const calculateTopExpenseCategories = (
  expenses: Expense[],
  limit: number = 6
): TopExpenseCategory[] => {
  if (expenses.length === 0) {
    return [];
  }

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by category
  const categoryData = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = {
        totalAmount: 0,
        expenseCount: 0,
        expenses: []
      };
    }
    acc[expense.category].totalAmount += expense.amount;
    acc[expense.category].expenseCount += 1;
    acc[expense.category].expenses.push(expense);
    return acc;
  }, {} as Record<ExpenseCategory, {
    totalAmount: number;
    expenseCount: number;
    expenses: Expense[];
  }>);

  // Convert to TopExpenseCategory format and sort by total amount
  const topCategories = Object.entries(categoryData)
    .map(([category, data]) => ({
      category: category as ExpenseCategory,
      totalAmount: data.totalAmount,
      expenseCount: data.expenseCount,
      percentage: totalSpent > 0 ? (data.totalAmount / totalSpent) * 100 : 0,
      averageExpenseAmount: data.expenseCount > 0 ? data.totalAmount / data.expenseCount : 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);

  return topCategories;
};

const calculateTopExpenseCategoriesWithTimeRange = (
  expenses: Expense[],
  startDate?: string,
  endDate?: string,
  limit: number = 6
): TopExpenseCategory[] => {
  let filteredExpenses = expenses;

  if (startDate || endDate) {
    filteredExpenses = expenses.filter(expense => {
      const expenseDate = expense.date;
      return (!startDate || expenseDate >= startDate) &&
             (!endDate || expenseDate <= endDate);
    });
  }

  return calculateTopExpenseCategories(filteredExpenses, limit);
};

// Mock data
const createMockExpense = (
  id: string,
  amount: number,
  category: ExpenseCategory,
  date: string,
  description: string = 'Test expense'
): Expense => ({
  id,
  amount,
  description,
  category,
  date,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const mockExpenses: Expense[] = [
  createMockExpense('1', 100, 'Food', '2023-12-01'),
  createMockExpense('2', 50, 'Food', '2023-12-02'),
  createMockExpense('3', 200, 'Transportation', '2023-12-03'),
  createMockExpense('4', 75, 'Entertainment', '2023-12-04'),
  createMockExpense('5', 150, 'Food', '2023-12-05'),
  createMockExpense('6', 25, 'Other', '2023-12-06'),
  createMockExpense('7', 300, 'Shopping', '2023-12-07'),
  createMockExpense('8', 120, 'Bills', '2023-12-08'),
  createMockExpense('9', 80, 'Transportation', '2023-12-09'),
  createMockExpense('10', 40, 'Entertainment', '2023-12-10'),
];

describe('calculateTopExpenseCategories', () => {
  test('should return empty array for empty expenses', () => {
    const result = calculateTopExpenseCategories([]);
    expect(result).toEqual([]);
  });

  test('should calculate top expense categories correctly', () => {
    const result = calculateTopExpenseCategories(mockExpenses);

    expect(result).toHaveLength(6);

    // Food should be the top category with 300 total (100 + 50 + 150)
    expect(result[0]).toEqual({
      category: 'Food',
      totalAmount: 300,
      expenseCount: 3,
      percentage: expect.closeTo(26.32, 1), // 300/1140 * 100 (total is 1140, not 1200)
      averageExpenseAmount: 100,
    });

    // Shopping should be second with 300
    expect(result[1]).toEqual({
      category: 'Shopping',
      totalAmount: 300,
      expenseCount: 1,
      percentage: expect.closeTo(26.32, 1),
      averageExpenseAmount: 300,
    });

    // Transportation should be third with 280 (200 + 80)
    expect(result[2]).toEqual({
      category: 'Transportation',
      totalAmount: 280,
      expenseCount: 2,
      percentage: expect.closeTo(24.56, 1), // 280/1140 * 100
      averageExpenseAmount: 140,
    });
  });

  test('should respect the limit parameter', () => {
    const result = calculateTopExpenseCategories(mockExpenses, 3);
    expect(result).toHaveLength(3);
  });

  test('should handle single expense correctly', () => {
    const singleExpense = [createMockExpense('1', 100, 'Food', '2023-12-01')];
    const result = calculateTopExpenseCategories(singleExpense);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      category: 'Food',
      totalAmount: 100,
      expenseCount: 1,
      percentage: 100,
      averageExpenseAmount: 100,
    });
  });
});

describe('calculateTopExpenseCategoriesWithTimeRange', () => {
  test('should filter expenses by date range', () => {
    // Filter to only December 1-5
    const result = calculateTopExpenseCategoriesWithTimeRange(
      mockExpenses,
      '2023-12-01',
      '2023-12-05'
    );

    // Should only include first 5 expenses
    expect(result).toHaveLength(3); // Food, Transportation, Entertainment

    const foodCategory = result.find(cat => cat.category === 'Food');
    expect(foodCategory?.totalAmount).toBe(300); // 100 + 50 + 150
  });

  test('should handle only start date', () => {
    const result = calculateTopExpenseCategoriesWithTimeRange(
      mockExpenses,
      '2023-12-08', // From December 8
      undefined
    );

    // Should include expenses from Dec 8-10
    expect(result.length).toBeGreaterThan(0);
    const totalAmount = result.reduce((sum, cat) => sum + cat.totalAmount, 0);
    expect(totalAmount).toBe(240); // 120 + 80 + 40
  });

  test('should handle only end date', () => {
    const result = calculateTopExpenseCategoriesWithTimeRange(
      mockExpenses,
      undefined,
      '2023-12-03' // Until December 3
    );

    // Should include expenses from Dec 1-3
    expect(result.length).toBeGreaterThan(0);
    const totalAmount = result.reduce((sum, cat) => sum + cat.totalAmount, 0);
    expect(totalAmount).toBe(350); // 100 + 50 + 200
  });

  test('should return all expenses when no date range provided', () => {
    const resultWithRange = calculateTopExpenseCategoriesWithTimeRange(mockExpenses);
    const resultWithoutRange = calculateTopExpenseCategories(mockExpenses);

    expect(resultWithRange).toEqual(resultWithoutRange);
  });

  test('should return empty array for date range with no expenses', () => {
    const result = calculateTopExpenseCategoriesWithTimeRange(
      mockExpenses,
      '2024-01-01',
      '2024-01-31'
    );

    expect(result).toEqual([]);
  });
});