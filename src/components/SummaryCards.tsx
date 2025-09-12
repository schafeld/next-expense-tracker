'use client';

import { ExpenseSummary } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardsProps {
  summary: ExpenseSummary;
  isLoading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  isLoading = false
}) => {
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
      icon: '💳'
    },
    {
      title: 'This Month',
      value: formatCurrency(summary.monthlySpent),
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconColor: 'text-green-500',
      icon: '📅'
    },
    {
      title: 'Top Category',
      value: summary.topCategory 
        ? `${summary.topCategory.name} (${formatCurrency(summary.topCategory.amount)})` 
        : 'No expenses',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconColor: 'text-purple-500',
      icon: '🏆'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-lg shadow-md p-6 border-l-4 border-blue-500`}
        >
          <div className="flex items-center">
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