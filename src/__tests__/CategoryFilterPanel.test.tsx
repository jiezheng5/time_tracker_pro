import { CategoryFilterPanel } from '@/components/ui/CategoryFilterPanel';
import { Category } from '@/types';
import { fireEvent, render, screen } from '@testing-library/react';

describe('CategoryFilterPanel', () => {
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
    {
      id: '3',
      name: 'Exercise',
      color: '#10B981',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockOnToggleCategory = jest.fn();
  const mockOnSelectAll = jest.fn();
  const mockOnSelectNone = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with all categories visible by default', () => {
    render(
      <CategoryFilterPanel
        categories={mockCategories}
        selectedCategories={[]} // Empty means all visible
        onToggleCategory={mockOnToggleCategory}
        onSelectAll={mockOnSelectAll}
        onSelectNone={mockOnSelectNone}
      />
    );

    expect(screen.getByText('Category Visibility')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Study')).toBeInTheDocument();
    expect(screen.getByText('Exercise')).toBeInTheDocument();
    expect(screen.getByText('All categories visible')).toBeInTheDocument();
  });

  test('shows filtered state when some categories are selected', () => {
    render(
      <CategoryFilterPanel
        categories={mockCategories}
        selectedCategories={['1']} // Only Work is selected/visible
        onToggleCategory={mockOnToggleCategory}
        onSelectAll={mockOnSelectAll}
        onSelectNone={mockOnSelectNone}
      />
    );

    expect(screen.getByText('2 of 3 visible')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  test('calls onToggleCategory when category is clicked', () => {
    render(
      <CategoryFilterPanel
        categories={mockCategories}
        selectedCategories={[]}
        onToggleCategory={mockOnToggleCategory}
        onSelectAll={mockOnSelectAll}
        onSelectNone={mockOnSelectNone}
      />
    );

    // Find the Work category row and click its visibility toggle
    const workRow = screen.getByText('Work').closest('div');
    const toggleButton = workRow?.querySelector('button');

    if (toggleButton) {
      fireEvent.click(toggleButton);
    }

    expect(mockOnToggleCategory).toHaveBeenCalledWith('1');
  });

  test('calls onSelectAll when Show All is clicked', () => {
    render(
      <CategoryFilterPanel
        categories={mockCategories}
        selectedCategories={['1']} // Some categories filtered
        onToggleCategory={mockOnToggleCategory}
        onSelectAll={mockOnSelectAll}
        onSelectNone={mockOnSelectNone}
      />
    );

    fireEvent.click(screen.getByText('Show All'));
    expect(mockOnSelectAll).toHaveBeenCalled();
  });

  test('calls onSelectNone when Hide All is clicked', () => {
    render(
      <CategoryFilterPanel
        categories={mockCategories}
        selectedCategories={[]} // All visible
        onToggleCategory={mockOnToggleCategory}
        onSelectAll={mockOnSelectAll}
        onSelectNone={mockOnSelectNone}
      />
    );

    fireEvent.click(screen.getByText('Hide All'));
    expect(mockOnSelectNone).toHaveBeenCalled();
  });

  test('disables Show All when all categories are visible', () => {
    render(
      <CategoryFilterPanel
        categories={mockCategories}
        selectedCategories={[]} // All visible
        onToggleCategory={mockOnToggleCategory}
        onSelectAll={mockOnSelectAll}
        onSelectNone={mockOnSelectNone}
      />
    );

    const showAllButton = screen.getByText('Show All');
    expect(showAllButton).toBeDisabled();
  });

  test('disables Hide All when no categories are visible', () => {
    render(
      <CategoryFilterPanel
        categories={mockCategories}
        selectedCategories={['1', '2', '3']} // All hidden (all selected in filter)
        onToggleCategory={mockOnToggleCategory}
        onSelectAll={mockOnSelectAll}
        onSelectNone={mockOnSelectNone}
      />
    );

    const hideAllButton = screen.getByText('Hide All');
    expect(hideAllButton).toBeDisabled();
    expect(screen.getByText('No categories visible')).toBeInTheDocument();
  });

  test('shows empty state when no categories provided', () => {
    render(
      <CategoryFilterPanel
        categories={[]}
        selectedCategories={[]}
        onToggleCategory={mockOnToggleCategory}
        onSelectAll={mockOnSelectAll}
        onSelectNone={mockOnSelectNone}
      />
    );

    expect(screen.getByText('No categories available')).toBeInTheDocument();
  });

  test('shows correct visibility status for each category', () => {
    render(
      <CategoryFilterPanel
        categories={mockCategories}
        selectedCategories={['2']} // Only Study is selected/visible
        onToggleCategory={mockOnToggleCategory}
        onSelectAll={mockOnSelectAll}
        onSelectNone={mockOnSelectNone}
      />
    );

    // Only Study should be visible (in selectedCategories)
    const visibleElements = screen.getAllByText('Visible');
    expect(visibleElements).toHaveLength(1);

    // Work and Exercise should be hidden (not in selectedCategories)
    const hiddenElements = screen.getAllByText('Hidden');
    expect(hiddenElements).toHaveLength(2);
  });
});
