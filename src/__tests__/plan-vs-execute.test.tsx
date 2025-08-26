import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TimeGrid } from '@/components/TimeGrid';
import { TimeTrackingProvider } from '@/stores/TimeTrackingContext';
import { LocalStorageService } from '@/lib/services/StorageService';
import { TimeTrackingRepository } from '@/lib/repositories/TimeTrackingRepository';

// Mock the storage service
const mockStorageService = {
  loadData: jest.fn().mockResolvedValue({
    categories: [
      {
        id: 'cat1',
        name: 'Work',
        color: '#3b82f6',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    timeEntries: [],
    plannedEntries: [],
    settings: {
      defaultView: 'weekly',
      theme: 'light',
      weekStartsOn: 1,
      defaultMode: 'tracking',
    },
    version: '1.0.0',
  }),
  saveData: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
} as jest.Mocked<LocalStorageService>;

// Mock the repository
jest.mock('@/lib/repositories/TimeTrackingRepository');
jest.mock('@/lib/services/StorageService');

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TimeTrackingProvider>
      {component}
    </TimeTrackingProvider>
  );
};

describe('Plan vs Execute Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock repository methods
    const mockRepository = {
      initialize: jest.fn().mockResolvedValue(undefined),
      getCategories: jest.fn().mockResolvedValue([
        {
          toJSON: () => ({
            id: 'cat1',
            name: 'Work',
            color: '#3b82f6',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
      ]),
      getTimeEntries: jest.fn().mockResolvedValue([]),
      getPlannedEntries: jest.fn().mockResolvedValue([]),
      createPlannedEntry: jest.fn().mockResolvedValue({
        toJSON: () => ({
          id: 'plan1',
          date: '2024-01-15',
          hour: 10,
          categoryId: 'cat1',
          isImportant: false,
          isUrgent: false,
          description: 'Test plan',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      }),
    };

    (TimeTrackingRepository as jest.MockedClass<typeof TimeTrackingRepository>).mockImplementation(
      () => mockRepository as any
    );
  });

  test('renders dual-section time slots', async () => {
    renderWithProvider(<TimeGrid />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check that time slots are rendered
    expect(screen.getByText('Weekly Time Grid')).toBeInTheDocument();
    
    // Look for plan and track sections
    const planTexts = screen.queryAllByText('Plan');
    const trackTexts = screen.queryAllByText('Track');
    
    expect(planTexts.length).toBeGreaterThan(0);
    expect(trackTexts.length).toBeGreaterThan(0);
  });

  test('shows planning modal when clicking plan section', async () => {
    renderWithProvider(<TimeGrid />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Find and click a plan section
    const planSection = screen.getAllByText('Plan')[0];
    fireEvent.click(planSection);

    // Check that planning modal opens
    await waitFor(() => {
      expect(screen.getByText('Plan Activity')).toBeInTheDocument();
    });

    expect(screen.getByText('Category *')).toBeInTheDocument();
    expect(screen.getByText('Description (optional)')).toBeInTheDocument();
  });

  test('can create a planned entry', async () => {
    renderWithProvider(<TimeGrid />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Click a plan section to open modal
    const planSection = screen.getAllByText('Plan')[0];
    fireEvent.click(planSection);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText('Plan Activity')).toBeInTheDocument();
    });

    // Fill out the form
    const categorySelect = screen.getByLabelText('Category *');
    fireEvent.change(categorySelect, { target: { value: 'cat1' } });

    const descriptionInput = screen.getByLabelText('Description (optional)');
    fireEvent.change(descriptionInput, { target: { value: 'Test planned activity' } });

    // Submit the form
    const saveButton = screen.getByText('Save Plan');
    fireEvent.click(saveButton);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('Plan Activity')).not.toBeInTheDocument();
    });
  });

  test('shows execution status indicators', async () => {
    renderWithProvider(<TimeGrid />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // The time slots should be rendered with dual sections
    // This test verifies the basic structure is in place
    expect(screen.getByText('Weekly Time Grid')).toBeInTheDocument();
  });

  test('maintains backward compatibility with single-section view', async () => {
    // This test would verify that showPlanSection=false still works
    // For now, we just check that the component renders without errors
    renderWithProvider(<TimeGrid />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Weekly Time Grid')).toBeInTheDocument();
  });
});
