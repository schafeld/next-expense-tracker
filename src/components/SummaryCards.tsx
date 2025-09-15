'use client';

import { useState, useEffect, useMemo } from 'react';
import { Expense, ExpenseSummary } from '@/types';
import { formatCurrency, calculateMonthlySpent, getAvailableMonths } from '@/lib/utils';

interface SummaryCardsProps {
  summary: ExpenseSummary;
  expenses: Expense[];
  isLoading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  expenses,
  isLoading = false
}) => {
  const now = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Handle cases where selectedMonth/Year might be null during initialization
  const currentMonth = selectedMonth ?? now.getMonth();
  const currentYear = selectedYear ?? now.getFullYear();

  const availableMonths = getAvailableMonths(expenses);
  const currentSelectedIndex = availableMonths.findIndex(
    m => m.month === currentMonth && m.year === currentYear
  );

  const canNavigatePrev = currentSelectedIndex < availableMonths.length - 1;
  const canNavigateNext = currentSelectedIndex > 0;

  const handlePrevMonth = () => {
    if (canNavigatePrev && currentSelectedIndex >= 0) {
      const prevMonth = availableMonths[currentSelectedIndex + 1];
      setSelectedMonth(prevMonth.month);
      setSelectedYear(prevMonth.year);
    }
  };

  const handleNextMonth = () => {
    if (canNavigateNext && currentSelectedIndex >= 0) {
      const nextMonth = availableMonths[currentSelectedIndex - 1];
      setSelectedMonth(nextMonth.month);
      setSelectedYear(nextMonth.year);
    }
  };

  useEffect(() => {
    if (availableMonths.length > 0 && (selectedMonth === null || selectedYear === null)) {
      // First try to find current month in available months
      const currentMonth = availableMonths.find(
        m => m.month === now.getMonth() && m.year === now.getFullYear()
      );

      if (currentMonth) {
        setSelectedMonth(currentMonth.month);
        setSelectedYear(currentMonth.year);
      } else {
        // Default to the most recent month (first in the sorted array)
        setSelectedMonth(availableMonths[0].month);
        setSelectedYear(availableMonths[0].year);
      }
    }
  }, [availableMonths, now, selectedMonth, selectedYear]);

  const selectedMonthlySpent = calculateMonthlySpent(expenses, currentMonth, currentYear);
  const selectedMonthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(currentYear, currentMonth)
  );

  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Spent',
      value: formatCurrency(summary.totalSpent),
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-500',
      icon: '💳',
      isNavigable: false
    },
    {
      title: isCurrentMonth ? 'This Month' : selectedMonthName,
      value: formatCurrency(selectedMonthlySpent),
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconColor: 'text-green-500',
      icon: '📅',
      isNavigable: true
    },
    {
      title: 'Top Category',
      value: summary.topCategory
        ? `${summary.topCategory.name} (${formatCurrency(summary.topCategory.amount)})`
        : 'No expenses',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconColor: 'text-purple-500',
      icon: '🏆',
      isNavigable: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-lg shadow-md p-6 border-l-4 border-blue-500 ${card.isNavigable ? 'relative' : ''}`}
        >
          {card.isNavigable && availableMonths.length > 1 && (
            <>
              <button
                onClick={handlePrevMonth}
                disabled={!canNavigatePrev}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-12 flex items-center justify-center rounded-md transition-all duration-200 ${
                  canNavigatePrev
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-50'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Previous month"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={handleNextMonth}
                disabled={!canNavigateNext}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-12 flex items-center justify-center rounded-md transition-all duration-200 ${
                  canNavigateNext
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-50'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Next month"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}
          <div className={`flex items-center ${card.isNavigable && availableMonths.length > 1 ? 'px-8' : ''}`}>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {card.title}
              </p>
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {index === 2 && summary.topCategory ? (
                  <span className="text-lg">{card.value}</span>
                ) : (
                  card.value
                )}
              </p>
            </div>
            <div className={`text-3xl ${card.iconColor} ml-4`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};