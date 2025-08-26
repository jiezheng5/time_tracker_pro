'use client';

import { Category, TimeEntry } from '@/types';
import {
  ArcElement,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  Tooltip,
} from 'chart.js';
import { Download } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryDistributionChartProps {
  timeEntries: TimeEntry[];
  categories: Category[];
  className?: string;
  onCategoryClick?: (categoryId: string) => void;
  selectedCategories?: string[]; // For highlighting selected categories
  containerWidth?: number; // For responsive sizing
}

export function CategoryDistributionChart({
  timeEntries,
  categories,
  className = '',
  onCategoryClick,
  containerWidth = 320,
  selectedCategories = []
}: CategoryDistributionChartProps) {
  const chartRef = useRef<ChartJS<'pie'>>(null);
  const chartData = useMemo(() => {
    // Count hours per category
    const categoryHours: Record<string, number> = {};

    timeEntries.forEach(entry => {
      categoryHours[entry.categoryId] = (categoryHours[entry.categoryId] || 0) + 1;
    });

    // Get categories that have time entries
    let usedCategories = categories.filter(cat => categoryHours[cat.id] > 0);

    // Apply category filter if any categories are selected
    if (selectedCategories.length > 0) {
      usedCategories = usedCategories.filter(cat => selectedCategories.includes(cat.id));
    }

    if (usedCategories.length === 0) {
      return null;
    }

    const labels = usedCategories.map(cat => cat.name);
    const data = usedCategories.map(cat => categoryHours[cat.id]);
    const backgroundColor = usedCategories.map(cat => cat.color);
    const borderColor = usedCategories.map(cat => cat.color);

    // Store category IDs for click handling
    const categoryIds = usedCategories.map(cat => cat.id);

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
          categoryIds, // Custom property for click handling
        },
      ],
    };
  }, [timeEntries, categories, selectedCategories]);

  const options: ChartOptions<'pie'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: containerWidth < 300 ? 0 : 750, // Faster animation for smaller widths
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onCategoryClick && chartData) {
        const elementIndex = elements[0].index;
        const dataset = chartData.datasets[0] as any;
        const categoryId = dataset.categoryIds[elementIndex];
        onCategoryClick(categoryId);
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'center' as const,
        labels: {
          padding: containerWidth < 350 ? 12 : 20,
          usePointStyle: true,
          font: {
            size: containerWidth < 350 ? 11 : 12,
            family: 'system-ui',
          },
          boxWidth: containerWidth < 350 ? 30 : 40,
        },
        maxWidth: containerWidth - 40, // Account for padding
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}h (${percentage}%) - Click to filter`;
          },
        },
        padding: containerWidth < 350 ? 8 : 12,
        bodyFont: {
          size: containerWidth < 350 ? 11 : 13,
        },
      },
    },
  }), [containerWidth, onCategoryClick, chartData]);

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

  const hasFilters = selectedCategories.length > 0;

  const exportChartAsPNG = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = 'category-distribution-chart.png';
      link.href = url;
      link.click();
    }
  };

  const exportDataAsCSV = () => {
    if (!chartData) return;

    const csvData = chartData.labels.map((label, index) => ({
      Category: label,
      Hours: chartData.datasets[0].data[index],
      Color: chartData.datasets[0].borderColor[index]
    }));

    const csvContent = [
      ['Category', 'Hours', 'Color'].join(','),
      ...csvData.map(row => [row.Category, row.Hours, row.Color].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'category-distribution-data.csv';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">
          Category Distribution
          {hasFilters && (
            <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Filtered ({selectedCategories.length} categories)
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {/* Export Buttons */}
          {chartData && (
            <div className="flex items-center gap-1">
              <button
                onClick={exportChartAsPNG}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Export chart as PNG"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={exportDataAsCSV}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Export data as CSV"
              >
                CSV
              </button>
            </div>
          )}
          {hasFilters && onCategoryClick && (
            <button
              onClick={() => {
                // Clear filters by calling onCategoryClick with empty string
                selectedCategories.forEach(categoryId => onCategoryClick(categoryId));
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      <div
        className="transition-all duration-300"
        style={{
          height: containerWidth < 300 ? '200px' : containerWidth < 400 ? '240px' : '280px'
        }}
      >
        <Pie ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
