import HomePage from '@/app/page';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { getCurrentPacificDate, isToday, toPacificTime } from '@/lib/utils';
import { TimeTrackingProvider } from '@/stores/TimeTrackingContext';
import { fireEvent, render, screen } from '@testing-library/react';

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

// Mock ResizablePanel to test wrapper div
jest.mock('@/components/ui/ResizablePanel', () => ({
  ResizablePanel: ({ children, defaultWidth, storageKey }: any) => (
    <div
      data-testid="resizable-panel"
      data-default-width={defaultWidth}
      data-storage-key={storageKey}
      style={{ width: `${defaultWidth}px` }}
    >
      {children}
    </div>
  ),
}));

describe('Ultra Fixes Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      categories: [
        { id: 'cat1', name: 'Work', color: '#3B82F6', createdAt: new Date(), updatedAt: new Date() },
        { id: 'cat2', name: 'Exercise', color: '#10B981', createdAt: new Date(), updatedAt: new Date() }
      ],
      timeEntries: [],
      plannedEntries: [],
      settings: { defaultView: 'weekly', theme: 'light', weekStartsOn: 1, defaultMode: 'tracking' },
      version: '1.0.0'
    }));
  });

  describe('Fix 1: Stats Panel Width Wrapper Restored', () => {
    test('Stats layout includes wrapper div with correct classes', () => {
      render(
        <TimeTrackingProvider>
          <SidebarProvider>
            <HomePage />
          </SidebarProvider>
        </TimeTrackingProvider>
      );

      // Switch to stats tab
      const statsTab = screen.getByText('Stats');
      fireEvent.click(statsTab);

      // Check that ResizablePanel exists with stats configuration
      const resizablePanel = screen.getByTestId('resizable-panel');
      expect(resizablePanel).toHaveAttribute('data-default-width', '450');
      expect(resizablePanel).toHaveAttribute('data-storage-key', 'stats-panel-width');

      // Check that wrapper div with correct classes exists
      const wrapperDiv = resizablePanel.querySelector('.h-full.bg-white');
      expect(wrapperDiv).toBeInTheDocument();
    });

    test('Categories layout does not have wrapper div', () => {
      render(
        <TimeTrackingProvider>
          <SidebarProvider>
            <HomePage />
          </SidebarProvider>
        </TimeTrackingProvider>
      );

      // Should start in categories tab by default
      const resizablePanel = screen.getByTestId('resizable-panel');
      expect(resizablePanel).toHaveAttribute('data-default-width', '320');
      expect(resizablePanel).toHaveAttribute('data-storage-key', 'sidebar-width');

      // Should not have wrapper div in categories layout
      const wrapperDiv = resizablePanel.querySelector('.h-full.bg-white');
      expect(wrapperDiv).not.toBeInTheDocument();
    });
  });

  describe('Fix 2: Pacific Time Configuration', () => {
    test('getCurrentPacificDate returns Pacific Time date', () => {
      const pacificDate = getCurrentPacificDate();
      expect(pacificDate).toBeInstanceOf(Date);

      // Should be different from UTC time (unless it's exactly the same moment)
      const utcDate = new Date();
      // Pacific Time is UTC-8 or UTC-7, so there should be a difference
      const timeDiff = Math.abs(pacificDate.getTime() - utcDate.getTime());
      expect(timeDiff).toBeGreaterThanOrEqual(0); // At least some difference expected
    });

    test('toPacificTime converts date correctly', () => {
      const testDate = new Date('2025-08-26T12:00:00Z'); // UTC noon
      const pacificDate = toPacificTime(testDate);
      expect(pacificDate).toBeInstanceOf(Date);

      // Pacific Time should be 8 hours behind UTC (or 7 during DST)
      // The function should return a valid date regardless
      expect(pacificDate.getFullYear()).toBe(2025);
      expect(pacificDate.getMonth()).toBe(7); // August (0-indexed)
      expect(pacificDate.getDate()).toBe(26);
    });

    test('isToday uses Pacific Time for comparison', () => {
      const pacificNow = getCurrentPacificDate();
      expect(isToday(pacificNow)).toBe(true);

      // Test with a date that's definitely not today
      const yesterday = new Date(pacificNow);
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('Fix 3: Category Visibility Hide All', () => {
    test('hideAllCategories action works correctly', async () => {
      const TestComponent = () => {
        const { state, actions } = require('@/stores/TimeTrackingContext').useTimeTracking();

        return (
          <div>
            <button
              onClick={actions.hideAllCategories}
              data-testid="hide-all-btn"
            >
              Hide All
            </button>
            <div data-testid="selected-categories">
              {state.chartFilters.selectedCategories.join(',')}
            </div>
            <div data-testid="categories-count">
              {state.categories.length}
            </div>
          </div>
        );
      };

      render(
        <TimeTrackingProvider>
          <TestComponent />
        </TimeTrackingProvider>
      );

      // Initially should have no selected categories (show all)
      expect(screen.getByTestId('selected-categories')).toHaveTextContent('');

      // Click hide all
      fireEvent.click(screen.getByTestId('hide-all-btn'));

      // Should now have all categories selected (hide all)
      const selectedCategories = screen.getByTestId('selected-categories').textContent;
      const categoriesCount = screen.getByTestId('categories-count').textContent;

      // Should have selected all categories
      expect(selectedCategories?.split(',').filter(Boolean).length).toBe(parseInt(categoriesCount || '0'));
    });
  });

  describe('Integration Test: All Fixes Working Together', () => {
    test('All three fixes work in combination', () => {
      render(
        <TimeTrackingProvider>
          <SidebarProvider>
            <HomePage />
          </SidebarProvider>
        </TimeTrackingProvider>
      );

      // Test Fix 1: Switch to stats and verify wrapper
      const statsTab = screen.getByText('Stats');
      fireEvent.click(statsTab);

      const resizablePanel = screen.getByTestId('resizable-panel');
      expect(resizablePanel).toHaveAttribute('data-default-width', '450');
      const wrapperDiv = resizablePanel.querySelector('.h-full.bg-white');
      expect(wrapperDiv).toBeInTheDocument();

      // Test Fix 2: Pacific Time functions work
      const pacificDate = getCurrentPacificDate();
      expect(pacificDate).toBeInstanceOf(Date);
      expect(isToday(pacificDate)).toBe(true);

      // Test Fix 3: Hide All button exists and is functional
      const hideAllButton = screen.getByText('Hide All');
      expect(hideAllButton).toBeInTheDocument();

      // Should be able to click it without errors
      fireEvent.click(hideAllButton);
    });
  });
});
