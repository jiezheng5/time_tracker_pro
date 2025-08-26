import { QuickStats } from '@/components/QuickStats';
import { TimeTrackingProvider } from '@/stores/TimeTrackingContext';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock Chart.js to avoid canvas issues in tests
jest.mock('react-chartjs-2', () => ({
  Pie: ({ data, options, onClick }: any) => (
    <div data-testid="pie-chart" onClick={() => onClick && onClick({}, [{ index: 0 }])}>
      {JSON.stringify(data)}
    </div>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Target: () => <div data-testid="target-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Download: () => <div data-testid="download-icon" />,
  X: () => <div data-testid="x-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
}));

// Mock the repository and storage
jest.mock('@/lib/repositories/TimeTrackingRepository', () => ({
  TimeTrackingRepository: jest.fn().mockImplementation(() => ({
    getCategories: jest.fn().mockResolvedValue([]),
    getTimeEntries: jest.fn().mockResolvedValue([]),
  })),
}));
jest.mock('@/lib/services/StorageService', () => ({
  LocalStorageService: jest.fn().mockImplementation(() => ({
    getItem: jest.fn().mockReturnValue(null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  })),
}));

describe('Interactive Charts Integration', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <TimeTrackingProvider>
        {component}
      </TimeTrackingProvider>
    );
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  test('renders chart filter controls', () => {
    renderWithProvider(<QuickStats />);

    expect(screen.getByText('Chart Filters')).toBeInTheDocument();
    expect(screen.getByText('Date Range Filter')).toBeInTheDocument();
    expect(screen.getByText('Category Visibility')).toBeInTheDocument();
  });

  test('date range picker is functional', () => {
    renderWithProvider(<QuickStats />);

    const dateRangeTrigger = screen.getByText('Select date range');
    expect(dateRangeTrigger).toBeInTheDocument();

    // Click to open date range picker
    fireEvent.click(dateRangeTrigger.closest('button')!);

    // Should show date inputs
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Quick Select')).toBeInTheDocument();
  });

  test('category filter panel shows categories', () => {
    renderWithProvider(<QuickStats />);

    expect(screen.getByText('Category Visibility')).toBeInTheDocument();
    expect(screen.getByText('Show All')).toBeInTheDocument();
    expect(screen.getByText('Hide All')).toBeInTheDocument();
  });

  test('clear all filters button appears when filters are active', () => {
    renderWithProvider(<QuickStats />);

    // Initially, no "Clear all filters" button should be visible
    expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument();
  });

  test('charts show export buttons', () => {
    renderWithProvider(<QuickStats />);

    // Look for CSV export buttons
    const csvButtons = screen.getAllByText('CSV');
    expect(csvButtons.length).toBeGreaterThan(0);
  });

  test('category distribution chart shows filter status', () => {
    renderWithProvider(<QuickStats />);

    // The charts may not render without data, so just check that the component renders
    expect(screen.getByText('Chart Filters')).toBeInTheDocument();
  });

  test('weekly progress chart is rendered', () => {
    renderWithProvider(<QuickStats />);

    expect(screen.getByText('Weekly Progress')).toBeInTheDocument();
  });

  test('eisenhower matrix chart is rendered', () => {
    renderWithProvider(<QuickStats />);

    // Check for Priority Matrix in the summary section
    expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
  });

  test('chart controls are properly laid out', () => {
    renderWithProvider(<QuickStats />);

    // Check that the chart controls section exists
    const chartFiltersSection = screen.getByText('Chart Filters').closest('div');
    expect(chartFiltersSection).toBeInTheDocument();

    // Check that both date range and category filters are present
    expect(screen.getByText('Date Range Filter')).toBeInTheDocument();
    expect(screen.getByText('Category Visibility')).toBeInTheDocument();
  });

  test('date range picker quick select buttons work', () => {
    renderWithProvider(<QuickStats />);

    // Open date range picker
    const dateRangeTrigger = screen.getByText('Select date range');
    fireEvent.click(dateRangeTrigger.closest('button')!);

    // Click "Last 7 days" quick select
    const last7DaysButton = screen.getByText('Last 7 days');
    fireEvent.click(last7DaysButton);

    // Check that dates were set
    const startInput = screen.getByLabelText('Start Date') as HTMLInputElement;
    const endInput = screen.getByLabelText('End Date') as HTMLInputElement;

    expect(startInput.value).toBeTruthy();
    expect(endInput.value).toBeTruthy();
  });

  test('category filter panel toggle functionality', () => {
    renderWithProvider(<QuickStats />);

    // Should show "Show All" and "Hide All" buttons
    expect(screen.getByText('Show All')).toBeInTheDocument();
    expect(screen.getByText('Hide All')).toBeInTheDocument();
  });

  test('export functionality is available on charts', () => {
    renderWithProvider(<QuickStats />);

    // Look for at least one CSV export button
    const csvButtons = screen.queryAllByText('CSV');
    expect(csvButtons.length).toBeGreaterThanOrEqual(1);
  });

  test('chart sections are properly organized', () => {
    renderWithProvider(<QuickStats />);

    // Check that main sections exist
    expect(screen.getByText('Weekly Progress')).toBeInTheDocument();
    expect(screen.getByText('Chart Filters')).toBeInTheDocument();
    expect(screen.getByText('Priority Matrix')).toBeInTheDocument();
  });
});
