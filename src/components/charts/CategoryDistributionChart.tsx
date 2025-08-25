'use client';

import { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Category, TimeEntry } from '@/types';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryDistributionChartProps {
  timeEntries: TimeEntry[];
  categories: Category[];
  className?: string;
}

export function CategoryDistributionChart({ 
  timeEntries, 
  categories, 
  className = '' 
}: CategoryDistributionChartProps) {
  const chartData = useMemo(() => {
    // Count hours per category
    const categoryHours: Record<string, number> = {};
    
    timeEntries.forEach(entry => {
      categoryHours[entry.categoryId] = (categoryHours[entry.categoryId] || 0) + 1;
    });

    // Get categories that have time entries
    const usedCategories = categories.filter(cat => categoryHours[cat.id] > 0);
    
    if (usedCategories.length === 0) {
      return null;
    }

    const labels = usedCategories.map(cat => cat.name);
    const data = usedCategories.map(cat => categoryHours[cat.id]);
    const backgroundColor = usedCategories.map(cat => cat.color);
    const borderColor = usedCategories.map(cat => cat.color);

    return {
      labels,
      datasets: [
        {
          label: 'Hours',
          data,
          backgroundColor: backgroundColor.map(color => color + '80'), // Add transparency
          borderColor,
          borderWidth: 2,
          hoverBackgroundColor: backgroundColor,
          hoverBorderWidth: 3,
        },
      ],
    };
  }, [timeEntries, categories]);

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}h (${percentage}%)`;
          },
        },
      },
    },
  };

  if (!chartData) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-sm text-gray-500">No time entries yet</p>
          <p className="text-xs text-gray-400">Add some time entries to see the distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-4">Category Distribution</h3>
      <div className="h-64">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}
