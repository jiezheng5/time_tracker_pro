/**
 * Test for chart components
 */

import { render } from '@testing-library/react';
import { CategoryDistributionChart } from '@/components/charts/CategoryDistributionChart';
import { WeeklyProgressChart } from '@/components/charts/WeeklyProgressChart';
import { EisenhowerMatrixChart } from '@/components/charts/EisenhowerMatrixChart';
import { Category, TimeEntry } from '@/types';

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Pie: ({ data }: { data: unknown }) => <div data-testid="pie-chart">{JSON.stringify(data)}</div>,
}));

jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  ArcElement: {},
  Tooltip: {},
  Legend: {},
}));

describe('Chart Components', () => {
  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'Work',
      color: '#3B82F6',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Study',
      color: '#EF4444',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockTimeEntries: TimeEntry[] = [
    {
      id: '1',
      date: '2025-08-25',
      hour: 9,
      categoryId: '1',
      isImportant: true,
      isUrgent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      date: '2025-08-25',
      hour: 10,
      categoryId: '2',
      isImportant: true,
      isUrgent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  test('CategoryDistributionChart renders with data', () => {
    render(
      <CategoryDistributionChart
        timeEntries={mockTimeEntries}
        categories={mockCategories}
      />
    );

    expect(document.querySelector('[data-testid="pie-chart"]')).toBeInTheDocument();
  });

  test('CategoryDistributionChart shows empty state with no data', () => {
    const { getByText } = render(
      <CategoryDistributionChart
        timeEntries={[]}
        categories={mockCategories}
      />
    );

    expect(getByText('No time entries yet')).toBeInTheDocument();
  });

  test('WeeklyProgressChart renders with data', () => {
    const { getByText } = render(
      <WeeklyProgressChart
        timeEntries={mockTimeEntries}
        currentWeek={new Date('2025-08-25')}
      />
    );

    expect(getByText('Weekly Progress')).toBeInTheDocument();
    expect(getByText('Overall Completion')).toBeInTheDocument();
  });

  test('EisenhowerMatrixChart renders with data', () => {
    const { getByText } = render(
      <EisenhowerMatrixChart
        timeEntries={mockTimeEntries}
      />
    );

    expect(getByText('Priority Distribution (Eisenhower Matrix)')).toBeInTheDocument();
    expect(getByText('Do First')).toBeInTheDocument();
    expect(getByText('Schedule')).toBeInTheDocument();
  });

  test('EisenhowerMatrixChart shows empty state with no data', () => {
    const { getByText } = render(
      <EisenhowerMatrixChart
        timeEntries={[]}
      />
    );

    expect(getByText('No time entries yet')).toBeInTheDocument();
  });
});

// Browser test function
export function testChartsInBrowser() {
  console.log('🧪 Testing charts in browser...');
  
  // Test 1: Check if charts are rendered
  const charts = document.querySelectorAll('[data-testid="pie-chart"], canvas');
  console.log('Charts found:', charts.length);
  
  // Test 2: Check if chart containers exist
  const chartContainers = document.querySelectorAll('.bg-white.rounded-lg.border');
  console.log('Chart containers found:', chartContainers.length);
  
  // Test 3: Check for specific chart titles
  const weeklyProgress = document.querySelector('h3')?.textContent?.includes('Weekly Progress');
  const categoryDistribution = document.querySelector('h3')?.textContent?.includes('Category Distribution');
  const eisenhowerMatrix = document.querySelector('h3')?.textContent?.includes('Priority Distribution');
  
  return {
    chartsCount: charts.length,
    containersCount: chartContainers.length,
    hasWeeklyProgress: weeklyProgress,
    hasCategoryDistribution: categoryDistribution,
    hasEisenhowerMatrix: eisenhowerMatrix,
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as typeof window & { testChartsInBrowser: typeof testChartsInBrowser }).testChartsInBrowser = testChartsInBrowser;
}
