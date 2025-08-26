import { render, screen, fireEvent } from '@testing-library/react';
import { ResizablePanel } from '@/components/ui/ResizablePanel';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  GripVertical: ({ className }: { className?: string }) => (
    <div data-testid="grip-icon" className={className}>
      ⋮⋮
    </div>
  ),
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

describe('ResizablePanel Debug Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  test('renders with visible resize handle', () => {
    render(
      <ResizablePanel defaultWidth={300}>
        <div data-testid="panel-content">Test Content</div>
      </ResizablePanel>
    );

    // Check that content is rendered
    expect(screen.getByTestId('panel-content')).toBeInTheDocument();
    
    // Check that grip icon is rendered
    expect(screen.getByTestId('grip-icon')).toBeInTheDocument();
    
    // Check for resize handle with proper attributes
    const resizeHandle = screen.getByRole('separator');
    expect(resizeHandle).toBeInTheDocument();
    expect(resizeHandle).toHaveAttribute('aria-label', 'Resize panel');
  });

  test('has correct CSS classes for resize handle', () => {
    render(
      <ResizablePanel defaultWidth={300}>
        <div>Test Content</div>
      </ResizablePanel>
    );

    const resizeHandle = screen.getByRole('separator');
    
    // Check for cursor-col-resize class
    expect(resizeHandle).toHaveClass('cursor-col-resize');
    
    // Check for z-index class
    expect(resizeHandle).toHaveClass('z-10');
    
    // Check for width class
    expect(resizeHandle).toHaveClass('w-2');
  });

  test('panel has correct initial width', () => {
    render(
      <ResizablePanel defaultWidth={400}>
        <div data-testid="panel-content">Test Content</div>
      </ResizablePanel>
    );

    // Find the panel container with inline style
    const panelContainer = document.querySelector('[style*="width: 400px"]');
    expect(panelContainer).toBeInTheDocument();
  });

  test('mousedown event is handled', () => {
    render(
      <ResizablePanel defaultWidth={300}>
        <div>Test Content</div>
      </ResizablePanel>
    );

    const resizeHandle = screen.getByRole('separator');
    
    // Simulate mousedown
    fireEvent.mouseDown(resizeHandle, { clientX: 300 });
    
    // The component should handle the event (no errors thrown)
    expect(resizeHandle).toBeInTheDocument();
  });

  test('saves width to localStorage', () => {
    render(
      <ResizablePanel defaultWidth={350} storageKey="test-panel">
        <div>Test Content</div>
      </ResizablePanel>
    );

    // Should save initial width
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-panel', '350');
  });

  test('loads width from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('450');

    render(
      <ResizablePanel defaultWidth={300} storageKey="test-panel">
        <div>Test Content</div>
      </ResizablePanel>
    );

    // Should use stored width instead of default
    const panelContainer = document.querySelector('[style*="width: 450px"]');
    expect(panelContainer).toBeInTheDocument();
  });

  test('constrains width within bounds', () => {
    mockLocalStorage.getItem.mockReturnValue('100'); // Below minimum

    render(
      <ResizablePanel 
        defaultWidth={300} 
        minWidth={250} 
        maxWidth={600}
        storageKey="test-panel"
      >
        <div>Test Content</div>
      </ResizablePanel>
    );

    // Should use minimum width when stored value is too small
    const panelContainer = document.querySelector('[style*="width: 250px"]');
    expect(panelContainer).toBeInTheDocument();
  });
});
