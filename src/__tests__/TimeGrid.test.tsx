import { TimeGrid } from '@/components/TimeGrid';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { render, screen } from '@testing-library/react';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  GripVertical: ({ className }: { className?: string }) => <div data-testid="grip-icon" className={className} />,
}));

// Mock the useTimeTracking hook
jest.mock('@/stores/TimeTrackingContext');

describe('TimeGrid', () => {
  test('displays the correct day of the week for a given date', () => {
    const mockState = {
      currentWeek: new Date('2025-08-26T12:00:00'),
      timeEntries: [],
      categories: [],
      plannedEntries: [],
      isLoading: false,
      error: null,
      chartFilters: {
        selectedCategories: [],
        selectedQuadrants: [],
      },
    };

    const mockActions = {
      clearCellData: jest.fn(),
    };

    (useTimeTracking as jest.Mock).mockReturnValue({ state: mockState, actions: mockActions });

    render(<TimeGrid />);

    // Check for Tuesday
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
  });
});
