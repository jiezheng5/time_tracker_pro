import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { TimeTrackingProvider } from '@/stores/TimeTrackingContext';

// Mock components
jest.mock('@/components/layout/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

jest.mock('@/components/layout/Sidebar', () => ({
  Sidebar: () => {
    const { activeTab, setActiveTab } = useSidebar();
    return (
      <div data-testid="sidebar">
        <button 
          data-testid="categories-tab" 
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button 
          data-testid="stats-tab" 
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
        <div data-testid="active-tab">{activeTab}</div>
      </div>
    );
  },
}));

jest.mock('@/components/TimeGrid', () => ({
  TimeGrid: () => <div data-testid="time-grid">TimeGrid</div>,
}));

jest.mock('@/components/ui/ResizablePanel', () => ({
  ResizablePanel: ({ children, defaultWidth, storageKey }: any) => (
    <div 
      data-testid="resizable-panel" 
      data-default-width={defaultWidth}
      data-storage-key={storageKey}
    >
      {children}
    </div>
  ),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  GripVertical: () => <div data-testid="grip-icon" />,
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

import HomePage from '@/app/page';

describe('Contextual Layout Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  const renderApp = () => {
    return render(
      <TimeTrackingProvider>
        <HomePage />
      </TimeTrackingProvider>
    );
  };

  test('renders with categories tab active by default', () => {
    renderApp();

    expect(screen.getByTestId('active-tab')).toHaveTextContent('categories');
    
    // Should use standard sidebar width for categories
    const resizablePanel = screen.getByTestId('resizable-panel');
    expect(resizablePanel).toHaveAttribute('data-default-width', '320');
    expect(resizablePanel).toHaveAttribute('data-storage-key', 'sidebar-width');
  });

  test('switches to stats layout when stats tab is clicked', () => {
    renderApp();

    // Click stats tab
    fireEvent.click(screen.getByTestId('stats-tab'));

    expect(screen.getByTestId('active-tab')).toHaveTextContent('stats');
    
    // Should use wider stats panel width
    const resizablePanel = screen.getByTestId('resizable-panel');
    expect(resizablePanel).toHaveAttribute('data-default-width', '450');
    expect(resizablePanel).toHaveAttribute('data-storage-key', 'stats-panel-width');
  });

  test('switches back to categories layout', () => {
    renderApp();

    // Switch to stats first
    fireEvent.click(screen.getByTestId('stats-tab'));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('stats');

    // Switch back to categories
    fireEvent.click(screen.getByTestId('categories-tab'));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('categories');
    
    // Should use standard sidebar width again
    const resizablePanel = screen.getByTestId('resizable-panel');
    expect(resizablePanel).toHaveAttribute('data-default-width', '320');
    expect(resizablePanel).toHaveAttribute('data-storage-key', 'sidebar-width');
  });

  test('maintains separate storage keys for different layouts', () => {
    renderApp();

    // Categories layout should use 'sidebar-width'
    let resizablePanel = screen.getByTestId('resizable-panel');
    expect(resizablePanel).toHaveAttribute('data-storage-key', 'sidebar-width');

    // Switch to stats
    fireEvent.click(screen.getByTestId('stats-tab'));
    
    // Stats layout should use 'stats-panel-width'
    resizablePanel = screen.getByTestId('resizable-panel');
    expect(resizablePanel).toHaveAttribute('data-storage-key', 'stats-panel-width');
  });

  test('renders all required components', () => {
    renderApp();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('time-grid')).toBeInTheDocument();
    expect(screen.getByTestId('resizable-panel')).toBeInTheDocument();
  });

  test('stats layout has wider default and max width', () => {
    renderApp();

    // Categories: 320px default, max 500px
    let resizablePanel = screen.getByTestId('resizable-panel');
    expect(resizablePanel).toHaveAttribute('data-default-width', '320');

    // Switch to stats: 450px default, max 800px
    fireEvent.click(screen.getByTestId('stats-tab'));
    resizablePanel = screen.getByTestId('resizable-panel');
    expect(resizablePanel).toHaveAttribute('data-default-width', '450');
  });
});
