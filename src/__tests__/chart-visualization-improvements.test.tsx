import { CategoryDistributionChart } from '@/components/charts/CategoryDistributionChart';
import { EisenhowerMatrixChart } from '@/components/charts/EisenhowerMatrixChart';
import { ResizablePanel } from '@/components/ui/ResizablePanel';
import { Category, TimeEntry } from '@/types';
import { render, screen } from '@testing-library/react';

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

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Download: ({ className }: { className?: string }) => <div data-testid="download-icon" className={className} />,
  GripVertical: ({ className }: { className?: string }) => <div data-testid="grip-icon" className={className} />,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Chart Visualization Improvements', () => {
  const mockCategories: Category[] = [
    {
      id: 'cat1',
      name: 'Work',
      color: '#3b82f6',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat2',
      name: 'Personal',
      color: '#ef4444',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockTimeEntries: TimeEntry[] = [
    {
      id: 'entry1',
      date: '2024-01-15',
      hour: 10,
      categoryId: 'cat1',
      isImportant: true,
      isUrgent: true,
      description: 'Important work',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'entry2',
      date: '2024-01-15',
      hour: 11,
      categoryId: 'cat2',
      isImportant: false,
      isUrgent: false,
      description: 'Leisure time',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ResizablePanel Component', () => {
    test('renders with default width', () => {
      render(
        <ResizablePanel>
          <div data-testid="panel-content">Test Content</div>
        </ResizablePanel>
      );

      expect(screen.getByTestId('panel-content')).toBeInTheDocument();
    });

    test('applies custom width constraints', () => {
      render(
        <ResizablePanel minWidth={200} maxWidth={500} defaultWidth={300}>
          <div data-testid="panel-content">Test Content</div>
        </ResizablePanel>
      );

      // Find the actual resizable panel container
      const panelContainer = document.querySelector('[style*="width: 300px"]');
      expect(panelContainer).toBeInTheDocument();
    });

    test('shows resize handle', () => {
      render(
        <ResizablePanel>
          <div>Test Content</div>
        </ResizablePanel>
      );

      // Check for resize handle (cursor-col-resize class)
      const resizeHandle = document.querySelector('.cursor-col-resize');
      expect(resizeHandle).toBeInTheDocument();
    });
  });

  describe('Enhanced CategoryDistributionChart', () => {
    test('accepts containerWidth prop', () => {
      render(
        <CategoryDistributionChart
          timeEntries={mockTimeEntries}
          categories={mockCategories}
          containerWidth={400}
        />
      );

      expect(screen.getByText('Category Distribution')).toBeInTheDocument();
    });

    test('adjusts chart height based on container width', () => {
      const { rerender } = render(
        <CategoryDistributionChart
          timeEntries={mockTimeEntries}
          categories={mockCategories}
          containerWidth={250}
        />
      );

      // Check for smaller height with narrow container
      let chartContainer = document.querySelector('[style*="height"]');
      expect(chartContainer).toHaveStyle('height: 200px');

      // Rerender with larger width
      rerender(
        <CategoryDistributionChart
          timeEntries={mockTimeEntries}
          categories={mockCategories}
          containerWidth={450}
        />
      );

      chartContainer = document.querySelector('[style*="height"]');
      expect(chartContainer).toHaveStyle('height: 280px');
    });
  });

  describe('Enhanced EisenhowerMatrixChart', () => {
    test('renders as pie chart', () => {
      render(
        <EisenhowerMatrixChart
          timeEntries={mockTimeEntries}
          containerWidth={400}
        />
      );

      expect(screen.getByText('Priority Distribution (Eisenhower Matrix)')).toBeInTheDocument();

      // Check that pie chart is rendered
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    test('shows export buttons', () => {
      render(
        <EisenhowerMatrixChart
          timeEntries={mockTimeEntries}
          containerWidth={400}
        />
      );

      // Check for export buttons
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    test('handles empty data gracefully', () => {
      render(
        <EisenhowerMatrixChart
          timeEntries={[]}
          containerWidth={400}
        />
      );

      // Should show empty state
      expect(screen.getByText('No time entries yet')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    test('charts adapt to different container widths', () => {
      const widths = [250, 350, 500];

      widths.forEach(width => {
        const { unmount } = render(
          <div>
            <CategoryDistributionChart
              timeEntries={mockTimeEntries}
              categories={mockCategories}
              containerWidth={width}
            />
            <EisenhowerMatrixChart
              timeEntries={mockTimeEntries}
              containerWidth={width}
            />
          </div>
        );

        // Verify charts render without errors at different widths
        expect(screen.getByText('Category Distribution')).toBeInTheDocument();
        expect(screen.getByText('Priority Distribution (Eisenhower Matrix)')).toBeInTheDocument();

        unmount();
      });
    });
  });
});
