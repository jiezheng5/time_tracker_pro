'use client';

import { cn } from '@/lib/utils';
import { TimeEntry } from '@/types';
import {
  ArcElement,
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  Tooltip
} from 'chart.js';
import { Download } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface EisenhowerMatrixChartProps {
  timeEntries: TimeEntry[];
  className?: string;
  containerWidth?: number;
}

interface QuadrantData {
  count: number;
  label: string;
  symbol: string;
  color: string;
}

type PieChartData = ChartData<'pie', number[], string>;

export function EisenhowerMatrixChart({
  timeEntries,
  className = '',
  containerWidth = 350
}: EisenhowerMatrixChartProps) {
  const chartRef = useRef<ChartJS<'pie'>>(null);

  const chartData = useMemo(() => {
    const quadrants: Record<string, QuadrantData> = {
      q1: { count: 0, label: 'Q1: Do First (Important + Urgent)', symbol: '🔥', color: '#ef4444' },
      q2: { count: 0, label: 'Q2: Schedule (Important)', symbol: '⭐', color: '#10b981' },
      q3: { count: 0, label: 'Q3: Delegate (Urgent)', symbol: '⚡', color: '#f59e0b' },
      q4: { count: 0, label: 'Q4: Eliminate (Neither)', symbol: '💤', color: '#6b7280' },
    };

    timeEntries.forEach(entry => {
      if (entry.isImportant && entry.isUrgent) {
        quadrants.q1.count++;
      } else if (entry.isImportant && !entry.isUrgent) {
        quadrants.q2.count++;
      } else if (!entry.isImportant && entry.isUrgent) {
        quadrants.q3.count++;
      } else {
        quadrants.q4.count++;
      }
    });

    const totalEntries = timeEntries.length;

    if (totalEntries === 0) {
      return null;
    }

    const data = Object.values(quadrants).filter(q => q.count > 0);

    const chartData: PieChartData = {
      labels: data.map(q => `${q.symbol} ${q.label}`),
      datasets: [
        {
          data: data.map(q => q.count),
          backgroundColor: data.map(q => q.color + '80'),
          borderColor: data.map(q => q.color),
          borderWidth: 2,
          hoverBackgroundColor: data.map(q => q.color),
          hoverBorderWidth: 3,
        },
      ],
    };

    return chartData;
  }, [timeEntries]);

  const options: ChartOptions<'pie'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: containerWidth < 350 ? 0 : 750,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          font: {
            size: containerWidth < 350 ? 11 : 12,
            family: 'system-ui',
          },
          boxWidth: containerWidth < 350 ? 30 : 40,
          padding: containerWidth < 350 ? 12 : 20,
        },
        maxWidth: containerWidth - 40,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}h (${percentage}%)`;
          },
        },
        padding: containerWidth < 350 ? 8 : 12,
        bodyFont: {
          size: containerWidth < 350 ? 11 : 13,
        },
      },
    },
  }), [containerWidth]);

  const exportChartAsPNG = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = 'priority-distribution-chart.png';
      link.href = url;
      link.click();
    }
  };

  const exportDataAsCSV = () => {
    if (!chartData?.labels) return;

    type ChartRowData = {
      Quadrant: string;
      Hours: number;
      Percentage: string;
    };

    const data = chartData.datasets[0].data;
    const total = data.reduce((a, b) => a + b, 0);

    const csvData: ChartRowData[] = chartData.labels.map((label, index) => ({
      Quadrant: label,
      Hours: data[index],
      Percentage: ((data[index] / total) * 100).toFixed(1),
    }));

    const csvContent = [
      ['Quadrant', 'Hours', 'Percentage'].join(','),
      ...csvData.map(row => [row.Quadrant, row.Hours, row.Percentage].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'priority-distribution-data.csv';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!chartData) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300",
        containerWidth < 350 ? "h-48" : "h-64",
        className
      )}>
        <div className="text-center px-4">
          <div className="text-gray-400 mb-2">📊</div>
          <p className={cn(
            "text-gray-500 mb-1",
            containerWidth < 350 ? "text-xs" : "text-sm"
          )}>No time entries yet</p>
          <p className={cn(
            "text-gray-400",
            containerWidth < 350 ? "text-[10px]" : "text-xs"
          )}>Add some time entries to see the priority distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white p-4 rounded-lg shadow", className)}>
      <div className={cn("space-y-4", containerWidth < 350 && "space-y-3")}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className={cn(
            "font-medium text-gray-900",
            containerWidth < 350 ? "text-xs" : "text-sm"
          )}>Priority Distribution</h3>
          {/* Export buttons */}
          <div className="flex gap-2">
            <button
              className={cn(
                "text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors",
                containerWidth < 350 ? "p-1" : "p-1.5"
              )}
              onClick={exportChartAsPNG}
              title="Export chart as PNG"
            >
              <Download className={cn("w-4 h-4", containerWidth < 350 && "w-3.5 h-3.5")} />
            </button>
            <button
              className={cn(
                "text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors",
                containerWidth < 350 ? "p-1" : "p-1.5"
              )}
              onClick={exportDataAsCSV}
              title="Export data as CSV"
            >
              CSV
            </button>
          </div>
        </div>

        {/* Chart */}
        <div
          style={{
            height: containerWidth < 350 ? '200px' : containerWidth < 450 ? '240px' : '280px'
          }}
        >
          <Pie ref={chartRef} data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}