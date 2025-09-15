import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopExpenseCategories } from '../TopExpenseCategories';
import { Expense, ExpenseCategory } from '@/types';

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
  createMockExpense('1', 300, 'Food', '2023-12-01', 'Grocery shopping'),
  createMockExpense('2', 200, 'Transportation', '2023-12-02', 'Gas'),
  createMockExpense('3', 150, 'Food', '2023-12-03', 'Restaurant'),
  createMockExpense('4', 100, 'Entertainment', '2023-12-04', 'Movie tickets'),
  createMockExpense('5', 80, 'Shopping', '2023-12-05', 'Clothes'),
  createMockExpense('6', 70, 'Bills', '2023-12-06', 'Internet'),
];

describe('TopExpenseCategories', () => {
  test('renders loading state correctly', () => {
    render(<TopExpenseCategories expenses={[]} isLoading={true} />);

    // Check for loading skeleton
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
    
    // Check that the main content containers exist
    const container = document.querySelector('.bg-white.rounded-lg.shadow-md');
    expect(container).toBeTruthy();
  });

  test('renders empty state when no expenses', () => {
    render(<TopExpenseCategories expenses={[]} isLoading={false} />);

    expect(screen.getByText('No Expenses Found')).toBeInTheDocument();
    expect(screen.getByText('No expenses found for the selected period.')).toBeInTheDocument();
  });

  test('renders expense categories correctly', () => {
    render(<TopExpenseCategories expenses={mockExpenses} isLoading={false} />);

    // Check if categories are displayed
    expect(screen.getByText('#1 Food')).toBeInTheDocument();
    expect(screen.getByText('#2 Transportation')).toBeInTheDocument();
    expect(screen.getByText('#3 Entertainment')).toBeInTheDocument();

    // Check amounts (Food: 300 + 150 = 450)
    expect(screen.getByText('$450.00')).toBeInTheDocument();
    // Transportation: 200
    expect(screen.getByText('$200.00')).toBeInTheDocument();
  });

  test('displays summary statistics correctly', () => {
    render(<TopExpenseCategories expenses={mockExpenses} isLoading={false} />);

    // Total amount: 300 + 200 + 150 + 100 + 80 + 70 = 900
    expect(screen.getByText('$900.00')).toBeInTheDocument();

    // Total expenses count
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  test('shows correct expense counts and averages', () => {
    render(<TopExpenseCategories expenses={mockExpenses} isLoading={false} />);

    // Food has 2 expenses with average of 225 (450/2)
    expect(screen.getByText(/2 expenses.*Avg: \$225\.00/)).toBeInTheDocument();

    // Transportation has 1 expense with average of 200
    expect(screen.getByText(/1 expense.*Avg: \$200\.00/)).toBeInTheDocument();
  });

  test('shows percentage correctly', () => {
    render(<TopExpenseCategories expenses={mockExpenses} isLoading={false} />);

    // Food: 450/900 = 50%
    expect(screen.getByText('50.0%')).toBeInTheDocument();

    // Transportation: 200/900 = 22.2%
    expect(screen.getByText('22.2%')).toBeInTheDocument();
  });

  test('period selector changes work', async () => {
    const user = userEvent.setup();
    render(<TopExpenseCategories expenses={mockExpenses} isLoading={false} />);

    // Click on "This Month" button
    const thisMonthButton = screen.getByText('This Month');
    await user.click(thisMonthButton);

    // Check if button is selected (should have blue background)
    expect(thisMonthButton).toHaveClass('bg-blue-600');

    // Summary should now show "This Month Total"
    expect(screen.getByText('This Month Total')).toBeInTheDocument();
  });

  test('custom date range shows and functions', async () => {
    const user = userEvent.setup();
    render(<TopExpenseCategories expenses={mockExpenses} isLoading={false} />);

    // Click on "Custom" button
    const customButton = screen.getByText('Custom');
    await user.click(customButton);

    // Check if date inputs are shown
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();

    // Summary should show "Custom Period Total"
    expect(screen.getByText('Custom Period Total')).toBeInTheDocument();
  });

  test('displays insights section', () => {
    render(<TopExpenseCategories expenses={mockExpenses} isLoading={false} />);

    expect(screen.getByText('💡 Quick Insights')).toBeInTheDocument();
    expect(screen.getByText(/Your top category accounts for 50\.0% of total spending/)).toBeInTheDocument();
    expect(screen.getByText(/Top 3 categories represent .* of your expenses/)).toBeInTheDocument();
  });

  test('handles single category correctly', () => {
    const singleCategoryExpenses = [
      createMockExpense('1', 100, 'Food', '2023-12-01', 'Test'),
    ];

    render(<TopExpenseCategories expenses={singleCategoryExpenses} isLoading={false} />);

    expect(screen.getByText('#1 Food')).toBeInTheDocument();
    expect(screen.getByText('100.0%')).toBeInTheDocument();
    
    // Look for the amount in the category card (text-right class indicates category amount)
    const categoryAmounts = screen.getAllByText('$100.00');
    expect(categoryAmounts.length).toBeGreaterThan(0);
  });

  test('renders category icons correctly', () => {
    render(<TopExpenseCategories expenses={mockExpenses} isLoading={false} />);

    // Check for emojis in the DOM (they should be visible as text content)
    const foodIcon = screen.getByText('🍽️');
    const transportationIcon = screen.getByText('🚗');
    const entertainmentIcon = screen.getByText('🎬');

    expect(foodIcon).toBeInTheDocument();
    expect(transportationIcon).toBeInTheDocument();
    expect(entertainmentIcon).toBeInTheDocument();
  });

  test('custom date range filters expenses correctly', async () => {
    const user = userEvent.setup();

    // Create expenses with specific dates
    const dateRangeExpenses = [
      createMockExpense('1', 100, 'Food', '2023-12-01'),
      createMockExpense('2', 200, 'Food', '2023-12-15'),
      createMockExpense('3', 300, 'Transportation', '2023-12-31'),
    ];

    render(<TopExpenseCategories expenses={dateRangeExpenses} isLoading={false} />);

    // Switch to custom period
    const customButton = screen.getByText('Custom');
    await user.click(customButton);

    // Set date range to exclude the last expense
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');

    await user.type(startDateInput, '2023-12-01');
    await user.type(endDateInput, '2023-12-20');

    // The total should be 300 (100 + 200), excluding the 300 from Dec 31
    // Look for it in the summary section specifically
    expect(screen.getByText('Custom Period Total')).toBeInTheDocument();
    
    // Get the summary section and check the total amount
    const summarySection = screen.getByText('Custom Period Total').closest('div');
    expect(summarySection).toHaveTextContent('$300.00');
  });
});