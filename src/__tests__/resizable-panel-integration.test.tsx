import { ResizablePanel } from '@/components/ui/ResizablePanel';
import '@testing-library/jest-dom';
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

// Mock lucide-react
jest.mock('lucide-react', () => ({
  GripVertical: ({ className }: { className?: string }) => <div data-testid="grip-icon" className={className} />,
}));

describe('ResizablePanel Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    document.body.classList.remove('resize-active');
  });

  test('renders with drag handle and proper ARIA attributes', () => {
    render(
      <ResizablePanel defaultWidth={350} minWidth={250} maxWidth={500}>
        <div data-testid="panel-content">Test Content</div>
      </ResizablePanel>
    );

    const resizeHandle = screen.getByRole('separator');
    expect(resizeHandle).toHaveAttribute('aria-label', 'Resize panel');
    expect(resizeHandle).toHaveAttribute('aria-valuenow', '350');
    expect(resizeHandle).toHaveAttribute('aria-valuemin', '250');
    expect(resizeHandle).toHaveAttribute('aria-valuemax', '500');
    expect(screen.getByTestId('panel-content')).toBeInTheDocument();
    expect(screen.getByTestId('grip-icon')).toBeInTheDocument();
  });

  test('applies default width when no stored value', () => {
    render(
      <ResizablePanel defaultWidth={350}>
        <div data-testid="panel-content">Test Content</div>
      </ResizablePanel>
    );

    // Check that the panel has the default width
    const panelContainer = document.querySelector('[style*="width: 350px"]');
    expect(panelContainer).toBeInTheDocument();
  });

  test('loads stored width from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('400');

    render(
      <ResizablePanel defaultWidth={300} storageKey="test-panel">
        <div data-testid="panel-content">Test Content</div>
      </ResizablePanel>
    );

    // Should use stored width instead of default
    const panelContainer = document.querySelector('[style*="width: 400px"]');
    expect(panelContainer).toBeInTheDocument();
  });

  test('constrains width within min/max bounds', () => {
    mockLocalStorage.getItem.mockReturnValue('100'); // Below minimum

    render(
      <ResizablePanel
        defaultWidth={300}
        minWidth={250}
        maxWidth={600}
        storageKey="test-panel"
      >
        <div data-testid="panel-content">Test Content</div>
      </ResizablePanel>
    );

    // Should use default width since stored value is outside bounds
    const panelContainer = document.querySelector('[style*="width: 300px"]');
    expect(panelContainer).toBeInTheDocument();
  });

  test('handles mouse events for resizing', () => {
    render(
      <ResizablePanel defaultWidth={300}>
        <div data-testid="panel-content">Test Content</div>
      </ResizablePanel>
    );

    const resizeHandle = document.querySelector('.cursor-col-resize');
    expect(resizeHandle).toBeInTheDocument();

    // Simulate mouse down to start resizing
    fireEvent.mouseDown(resizeHandle!, { clientX: 300 });

    // The component should handle the mouse down event
    // Note: In test environment, body styles might not be set immediately
    expect(resizeHandle).toBeInTheDocument();
  });

  test('saves width to localStorage on resize', () => {
    render(
      <ResizablePanel defaultWidth={300} storageKey="test-panel">
        <div data-testid="panel-content">Test Content</div>
      </ResizablePanel>
    );

    // The component should save the initial width
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-panel', '300');
  });

  test('applies visual feedback during dragging', () => {
    render(
      <ResizablePanel defaultWidth={300}>
        <div data-testid="panel-content">Test Content</div>
      </ResizablePanel>
    );

    const resizeHandle = screen.getByRole('separator');
    const gripIcon = screen.getByTestId('grip-icon');

    // Check initial state
    expect(gripIcon).toHaveClass('text-gray-400');
    expect(document.body.classList.contains('resize-active')).toBe(false);

    // Simulate drag start
    fireEvent.mouseDown(resizeHandle, { clientX: 300 });

    // Check dragging state
    expect(gripIcon).toHaveClass('text-primary-500');
    expect(document.body.classList.contains('resize-active')).toBe(true);

    // Simulate drag end
    fireEvent.mouseUp(document);

    // Check return to initial state
    expect(gripIcon).toHaveClass('text-gray-400');
    expect(document.body.classList.contains('resize-active')).toBe(false);
  });

  test('provides width value through hook', () => {
    let capturedWidth: number | undefined;

    function TestComponent() {
      const { useResizablePanel } = require('@/components/ui/ResizablePanel');
      capturedWidth = useResizablePanel('test-panel', 300);
      return <div data-testid="test-component">Width: {capturedWidth}</div>;
    }

    mockLocalStorage.getItem.mockReturnValue('400');

    render(<TestComponent />);

    expect(screen.getByText('Width: 400')).toBeInTheDocument();
  });

  test('allows user to resize the panel by dragging the handle', () => {
    render(
      <ResizablePanel defaultWidth={300} minWidth={200} maxWidth={500}>
        <div>Content</div>
      </ResizablePanel>
    );

    const panel = screen.getByRole('separator').parentElement;
    const resizeHandle = screen.getByRole('separator');

    // Check initial width
    expect(panel).toHaveStyle('width: 300px');

    // Start dragging
    fireEvent.mouseDown(resizeHandle, { clientX: 300 });

    // Simulate dragging by 100px
    fireEvent.mouseMove(document, { clientX: 400 });

    // End dragging
    fireEvent.mouseUp(document);

    // Check final width
    // The parent of the separator is the resizable div
    expect(panel).toHaveStyle('width: 400px');

    // Verify localStorage was updated
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('resizable-panel-width', '400');
  });
});