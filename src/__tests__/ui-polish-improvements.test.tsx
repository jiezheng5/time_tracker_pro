import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TimeTrackingProvider } from '@/stores/TimeTrackingContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TimeSlot } from '@/components/TimeSlot';
import { TimeSlotData, ExecutionStatus } from '@/types';

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

// Mock window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
});

describe('UI Polish & Minor Improvements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      categories: [],
      timeEntries: [],
      plannedEntries: [],
      settings: { defaultView: 'weekly', theme: 'light', weekStartsOn: 1, defaultMode: 'tracking' },
      version: '1.0.0'
    }));
  });

  describe('Clear Week Functionality', () => {
    test('Header contains Clear Week button', () => {
      render(
        <TimeTrackingProvider>
          <Header />
        </TimeTrackingProvider>
      );

      const clearWeekButton = screen.getByText('Clear Week');
      expect(clearWeekButton).toBeInTheDocument();
      expect(clearWeekButton).toHaveAttribute('title', 'Clear all entries for this week');
    });

    test('Clear Week button shows confirmation dialog', () => {
      mockConfirm.mockReturnValue(false);

      render(
        <TimeTrackingProvider>
          <Header />
        </TimeTrackingProvider>
      );

      const clearWeekButton = screen.getByText('Clear Week');
      fireEvent.click(clearWeekButton);

      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to clear all time entries for this week? This action cannot be undone.'
      );
    });
  });

  describe('Clear Cell Functionality', () => {
    test('TimeSlot shows clear button for filled cells', () => {
      const mockTimeSlot: TimeSlotData = {
        date: '2024-01-01',
        hour: 10,
        actualEntry: {
          id: '1',
          date: '2024-01-01',
          hour: 10,
          categoryId: 'cat1',
          isImportant: true,
          isUrgent: false,
          description: 'Test entry',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        actualCategory: {
          id: 'cat1',
          name: 'Work',
          color: '#3B82F6',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        executionStatus: ExecutionStatus.EXECUTED
      };

      const mockOnClearCell = jest.fn();

      render(
        <TimeSlot
          timeSlot={mockTimeSlot}
          onClick={() => {}}
          onClearCell={mockOnClearCell}
          showPlanSection={true}
        />
      );

      // The clear button should be present but hidden (opacity-0)
      const clearButton = screen.getByTitle('Clear this time slot');
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('Default Categories Loading', () => {
    test('Sidebar contains Load Default Categories button', () => {
      render(
        <TimeTrackingProvider>
          <SidebarProvider>
            <Sidebar />
          </SidebarProvider>
        </TimeTrackingProvider>
      );

      const loadDefaultButton = screen.getByText('Load Default Categories');
      expect(loadDefaultButton).toBeInTheDocument();
    });

    test('Load Default Categories button shows confirmation dialog', () => {
      mockConfirm.mockReturnValue(false);

      render(
        <TimeTrackingProvider>
          <SidebarProvider>
            <Sidebar />
          </SidebarProvider>
        </TimeTrackingProvider>
      );

      const loadDefaultButton = screen.getByText('Load Default Categories');
      fireEvent.click(loadDefaultButton);

      expect(mockConfirm).toHaveBeenCalledWith(
        'This will replace ALL existing categories with 8 predefined default categories. This action cannot be undone. Continue?'
      );
    });
  });

  describe('Chart Filters Layout', () => {
    test('Chart filters use vertical stacked layout', () => {
      render(
        <TimeTrackingProvider>
          <SidebarProvider>
            <Sidebar />
          </SidebarProvider>
        </TimeTrackingProvider>
      );

      // Switch to stats tab to see chart filters
      const statsTab = screen.getByText('Stats');
      fireEvent.click(statsTab);

      // Check for the presence of chart filters section
      const chartFiltersSection = screen.getByText('Chart Filters');
      expect(chartFiltersSection).toBeInTheDocument();

      // The parent container should use space-y-4 class for vertical stacking
      const filtersContainer = chartFiltersSection.closest('.card')?.querySelector('.space-y-4');
      expect(filtersContainer).toBeInTheDocument();
    });
  });
});
