'use client';

import { useState, useEffect } from 'react';
import { Expense, ExpenseFormData, ExpenseFilters, ExpenseSummary } from '@/types';
import { storageUtils } from '@/lib/storage';
import { generateId, filterExpenses, calculateSummary } from '@/lib/utils';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load expenses from localStorage on mount
  useEffect(() => {
    const loadedExpenses = storageUtils.getExpenses();
    setExpenses(loadedExpenses);
    setIsLoading(false);
  }, []);

  const addExpense = (formData: ExpenseFormData): void => {
    const newExpense: Expense = {
      id: generateId(),
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: formData.date,
      vendor: formData.vendor && formData.vendor.trim() ? formData.vendor.trim() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    storageUtils.saveExpenses(updatedExpenses);
  };

  const updateExpense = (id: string, formData: ExpenseFormData): void => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === id
        ? {
            ...expense,
            amount: parseFloat(formData.amount),
            description: formData.description,
            category: formData.category,
            date: formData.date,
            vendor: formData.vendor && formData.vendor.trim() ? formData.vendor.trim() : undefined,
            updatedAt: new Date().toISOString(),
          }
        : expense
    );

    setExpenses(updatedExpenses);
    storageUtils.saveExpenses(updatedExpenses);
  };

  const deleteExpense = (id: string): void => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    storageUtils.saveExpenses(updatedExpenses);
  };

  const getFilteredExpenses = (filters: ExpenseFilters): Expense[] => {
    return filterExpenses(expenses, filters);
  };

  const getSummary = (): ExpenseSummary => {
    return calculateSummary(expenses);
  };

  return {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    getFilteredExpenses,
    getSummary,
  };
};