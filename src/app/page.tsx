'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Expense, ExpenseFormData, ExpenseFilters } from '@/types';
import { useExpenses } from '@/hooks/useExpenses';
import {
  ExpenseForm,
  ExpenseList,
  ExpenseFiltersComponent,
  SummaryCards,
  CategoryChart,
} from '@/components';
import { ExportButton } from '@/components/ExportButton';
import { TopVendorsCard } from '@/components/TopVendorsCard';
import { groupExpensesByVendor } from '@/lib/utils';

export default function Home() {
  const {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    getFilteredExpenses,
    getSummary,
  } = useExpenses();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [showForm, setShowForm] = useState(false);

  const filteredExpenses = getFilteredExpenses(filters);
  const summary = getSummary();

  // Process vendor data for the TopVendorsCard
  const vendors = useMemo(() => {
    return groupExpensesByVendor(expenses);
  }, [expenses]);

  const handleAddExpense = (formData: ExpenseFormData) => {
    addExpense(formData);
    setShowForm(false);
  };

  const handleUpdateExpense = (formData: ExpenseFormData) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, formData);
      setEditingExpense(null);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(false); // Close add form if open
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(expenseId);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                💰 Expense Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Track and manage your personal expenses
              </p>
            </div>
            <div className="flex space-x-3">
              <ExportButton expenses={filteredExpenses} />
              <Link
                href="/top-categories"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              >
                📊 Top Categories
              </Link>
              <Link
                href="/top-vendors"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                🏪 Top Vendors
              </Link>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {showForm ? '❌ Cancel' : '➕ Add Expense'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <SummaryCards summary={summary} expenses={expenses} isLoading={isLoading} />

        {/* Add Expense Form */}
        {showForm && (
          <div className="mb-8">
            <ExpenseForm
              onSubmit={handleAddExpense}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Edit Expense Form */}
        {editingExpense && (
          <div className="mb-8">
            <ExpenseForm
              onSubmit={handleUpdateExpense}
              initialData={{
                amount: editingExpense.amount.toString(),
                description: editingExpense.description,
                category: editingExpense.category,
                date: editingExpense.date,
              }}
              isEditing={true}
              onCancel={handleCancelEdit}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <ExpenseFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
            />

            {/* Expense List */}
            <ExpenseList
              expenses={filteredExpenses}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              isLoading={isLoading}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <CategoryChart summary={summary} isLoading={isLoading} />
            <TopVendorsCard vendors={vendors} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
