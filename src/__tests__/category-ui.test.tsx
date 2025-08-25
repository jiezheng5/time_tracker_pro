/**
 * UI Integration test for category creation
 * Tests the complete user interaction flow
 */

import { CategoryList } from '@/components/CategoryList';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { TimeTrackingProvider } from '@/stores/TimeTrackingContext';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Category UI Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  test('CategoryForm submission creates category and updates UI', async () => {
    let onSuccessCalled = false;
    const onSuccess = () => {
      onSuccessCalled = true;
    };

    render(
      <TimeTrackingProvider>
        <CategoryForm onSuccess={onSuccess} />
      </TimeTrackingProvider>
    );

    // Fill out the form
    const nameInput = screen.getByLabelText(/category name/i);
    const submitButton = screen.getByRole('button', { name: /add category/i });

    fireEvent.change(nameInput, { target: { value: 'Test UI Category' } });

    // Select a color (click the first color option)
    const colorButtons = screen.getAllByRole('button');
    const firstColorButton = colorButtons.find(btn =>
      btn.className.includes('w-8 h-8 rounded-lg')
    );
    if (firstColorButton) {
      fireEvent.click(firstColorButton);
    }

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(onSuccessCalled).toBe(true);
    }, { timeout: 3000 });

    // Verify localStorage was called
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  test('CategoryList displays categories from context', async () => {
    render(
      <TimeTrackingProvider>
        <CategoryList />
      </TimeTrackingProvider>
    );

    // Wait for the component to load
    await waitFor(() => {
      // Should show default categories
      expect(screen.getByText(/work/i)).toBeInTheDocument();
    });
  });

  test('Complete category creation flow', async () => {
    const TestComponent = () => {
      return (
        <TimeTrackingProvider>
          <div>
            <CategoryForm onSuccess={() => console.log('Form success')} />
            <CategoryList />
          </div>
        </TimeTrackingProvider>
      );
    };

    render(<TestComponent />);

    // Get initial category count
    await waitFor(() => {
      expect(screen.getByText(/work/i)).toBeInTheDocument();
    });

    const initialCategories = screen.getAllByText(/edit/i).length;

    // Add a new category
    const nameInput = screen.getByLabelText(/category name/i);
    fireEvent.change(nameInput, { target: { value: 'Integration Test Category' } });

    // Select first color
    const colorButtons = screen.getAllByRole('button');
    const firstColorButton = colorButtons.find(btn =>
      btn.className.includes('w-8 h-8 rounded-lg')
    );
    if (firstColorButton) {
      fireEvent.click(firstColorButton);
    }

    // Submit
    const submitButton = screen.getByRole('button', { name: /add category/i });
    fireEvent.click(submitButton);

    // Wait for new category to appear
    await waitFor(() => {
      const newCategories = screen.getAllByText(/edit/i).length;
      expect(newCategories).toBe(initialCategories + 1);
    }, { timeout: 5000 });

    // Verify the new category name appears
    expect(screen.getByText('Integration Test Category')).toBeInTheDocument();
  });
});

// Browser console test function
export function testCategoryCreationInBrowser() {
  console.log('🧪 Testing category creation in browser...');

  // Test 1: Check if context is available
  const contextElement = document.querySelector('[data-testid="time-tracking-context"]');
  console.log('Context element found:', !!contextElement);

  // Test 2: Check current categories
  const categoryElements = document.querySelectorAll('[data-testid="category-item"]');
  console.log('Current categories count:', categoryElements.length);

  // Test 3: Check if form is present
  const formElement = document.querySelector('form');
  console.log('Form element found:', !!formElement);

  return {
    contextAvailable: !!contextElement,
    categoriesCount: categoryElements.length,
    formAvailable: !!formElement
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as typeof window & { testCategoryCreationInBrowser: typeof testCategoryCreationInBrowser }).testCategoryCreationInBrowser = testCategoryCreationInBrowser;
}
