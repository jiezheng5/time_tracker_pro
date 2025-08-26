import { render, screen } from '@testing-library/react';
import { QuickStats } from '@/components/QuickStats';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { TimeTrackingProvider } from '@/stores/TimeTrackingContext';

// Mock the charts
jest.mock('@/components/charts/CategoryDistributionChart', () => ({
  CategoryDistributionChart: ({ containerWidth }: { containerWidth: number }) => (
    <div data-testid="category-chart" data-container-width={containerWidth}>
      Category Chart
    </div>
  ),
}));

jest.mock('@/components/charts/WeeklyProgressChart', () => ({
  __esModule: true,
  default: ({ containerWidth }: { containerWidth: number }) => (
    <div data-testid="weekly-chart" data-container-width={containerWidth}>
      Weekly Chart
    </div>
  ),
}));

jest.mock('@/components/charts/EisenhowerMatrixChart', () => ({
  EisenhowerMatrixChart: ({ containerWidth }: { containerWidth: number }) => (
    <div data-testid="eisenhower-chart" data-container-width={containerWidth}>
      Eisenhower Chart
    </div>
  ),
}));

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

jest.mock('chart.js', () => ({
  Chart: { register: jest.fn() },
  ArcElement: {},
  Tooltip: {},
  Legend: {},
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Download: () => <div data-testid="download-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  X: () => <div data-testid="x-icon" />,
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

// Mock sidebar context with different tab states
const MockSidebarProvider = ({ 
  children, 
  activeTab = 'categories' 
}: { 
  children: React.ReactNode; 
  activeTab?: 'categories' | 'stats';
}) => {
  const mockContextValue = {
    activeTab,
    setActiveTab: jest.fn(),
  };

  return (
    <div data-testid={`mock-sidebar-${activeTab}`}>
      {/* Simulate the context provider */}
      {React.cloneElement(children as React.ReactElement, { 
        mockSidebarContext: mockContextValue 
      })}
    </div>
  );
};

// Override the useSidebar hook for testing
jest.mock('@/contexts/SidebarContext', () => ({
  useSidebar: () => {
    // Get the active tab from the test environment
    const element = document.querySelector('[data-testid^="mock-sidebar-"]');
    const activeTab = element?.getAttribute('data-testid')?.replace('mock-sidebar-', '') || 'categories';
    return {
      activeTab,
      setActiveTab: jest.fn(),
    };
  },
  SidebarProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('QuickStats Panel Width Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  const renderQuickStats = (activeTab: 'categories' | 'stats' = 'categories') => {
    return render(
      <MockSidebarProvider activeTab={activeTab}>
        <TimeTrackingProvider>
          <QuickStats />
        </TimeTrackingProvider>
      </MockSidebarProvider>
    );
  };

  test('uses sidebar-width storage key when on categories tab', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'sidebar-width') return '350';
      if (key === 'stats-panel-width') return '500';
      return null;
    });

    renderQuickStats('categories');

    // Should use sidebar-width (350) not stats-panel-width (500)
    const categoryChart = screen.getByTestId('category-chart');
    expect(categoryChart).toHaveAttribute('data-container-width', '350');
  });

  test('uses stats-panel-width storage key when on stats tab', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'sidebar-width') return '350';
      if (key === 'stats-panel-width') return '500';
      return null;
    });

    renderQuickStats('stats');

    // Should use stats-panel-width (500) not sidebar-width (350)
    const categoryChart = screen.getByTestId('category-chart');
    expect(categoryChart).toHaveAttribute('data-container-width', '500');
  });

  test('uses correct default width for categories tab', () => {
    // No stored values
    mockLocalStorage.getItem.mockReturnValue(null);

    renderQuickStats('categories');

    // Should use default width 320 for categories
    const categoryChart = screen.getByTestId('category-chart');
    expect(categoryChart).toHaveAttribute('data-container-width', '320');
  });

  test('uses correct default width for stats tab', () => {
    // No stored values
    mockLocalStorage.getItem.mockReturnValue(null);

    renderQuickStats('stats');

    // Should use default width 450 for stats
    const categoryChart = screen.getByTestId('category-chart');
    expect(categoryChart).toHaveAttribute('data-container-width', '450');
  });

  test('passes container width to all chart components', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'stats-panel-width') return '600';
      return null;
    });

    renderQuickStats('stats');

    // All charts should receive the same container width
    expect(screen.getByTestId('category-chart')).toHaveAttribute('data-container-width', '600');
    expect(screen.getByTestId('weekly-chart')).toHaveAttribute('data-container-width', '600');
    expect(screen.getByTestId('eisenhower-chart')).toHaveAttribute('data-container-width', '600');
  });
});
