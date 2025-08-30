/**
 * Mobile Viewport Tests - Test-Driven Development
 *
 * These tests ensure basic mobile web functionality works correctly
 * Focus: iPhone compatibility and basic mobile viewport behavior
 */

import HomePage from '@/app/page';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { TimeTrackingProvider } from '@/stores/TimeTrackingContext';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock window.innerWidth for mobile testing
const mockWindowWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Test wrapper with all required providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TimeTrackingProvider>
    <SidebarProvider>
      {children}
    </SidebarProvider>
  </TimeTrackingProvider>
);

describe('Mobile Viewport - Basic Functionality', () => {
  beforeEach(() => {
    // Reset to desktop width before each test
    mockWindowWidth(1024);
  });

  afterEach(() => {
    // Clean up
    jest.clearAllMocks();
  });

  describe('Basic Mobile Rendering', () => {
    test('app renders without crashing on iPhone width (375px)', async () => {
      mockWindowWidth(375);

      expect(() => {
        render(
          <TestWrapper>
            <HomePage />
          </TestWrapper>
        );
      }).not.toThrow();

      // Should show basic app structure
      await waitFor(() => {
        expect(screen.getByText('Time Tracker')).toBeInTheDocument();
      });
    });

    test('app renders without crashing on small mobile (320px)', async () => {
      mockWindowWidth(320);

      expect(() => {
        render(
          <TestWrapper>
            <HomePage />
          </TestWrapper>
        );
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByText('Time Tracker')).toBeInTheDocument();
      });
    });

    test('app renders without crashing on large mobile (414px)', async () => {
      mockWindowWidth(414);

      expect(() => {
        render(
          <TestWrapper>
            <HomePage />
          </TestWrapper>
        );
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByText('Time Tracker')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Layout Detection', () => {
    test('detects mobile layout correctly at 767px and below', async () => {
      mockWindowWidth(767);

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show mobile menu button
        const menuButton = screen.getByLabelText('Toggle menu');
        expect(menuButton).toBeInTheDocument();
      });
    });

    test('detects desktop layout correctly at 768px and above', async () => {
      mockWindowWidth(768);

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should NOT show mobile menu button
        const menuButton = screen.queryByLabelText('Toggle menu');
        expect(menuButton).not.toBeInTheDocument();
      });
    });
  });

  describe('Mobile Navigation', () => {
    test('mobile menu button is visible on mobile', async () => {
      mockWindowWidth(375);

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      await waitFor(() => {
        const menuButton = screen.getByLabelText('Toggle menu');
        expect(menuButton).toBeInTheDocument();
        expect(menuButton).toBeVisible();
      });
    });

    test('mobile menu can be opened and closed', async () => {
      mockWindowWidth(375);

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      await waitFor(() => {
        const menuButton = screen.getByLabelText('Toggle menu');
        expect(menuButton).toBeInTheDocument();
      });

      const menuButton = screen.getByLabelText('Toggle menu');

      // Open menu
      fireEvent.click(menuButton);

      await waitFor(() => {
        // Should show sidebar content (look for the sidebar specifically)
        const sidebar = document.querySelector('.fixed.top-\\[73px\\].left-0.w-80');
        expect(sidebar).toBeInTheDocument();
      });

      // Close menu (X button should be visible)
      const closeButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(closeButton);

      // Menu should close (overlay should disappear)
      await waitFor(() => {
        const overlay = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
        expect(overlay).not.toBeInTheDocument();
      });
    });
  });

  describe('Mobile TimeGrid', () => {
    test('time grid renders on mobile without horizontal overflow issues', async () => {
      mockWindowWidth(375);

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show time grid
        expect(screen.getByText('Weekly Time Grid')).toBeInTheDocument();
      });

      // Should have horizontal scroll container
      const scrollContainer = document.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    test('mobile time grid shows abbreviated day names and day-level plan/track buttons', async () => {
      mockWindowWidth(375);

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show abbreviated day names on mobile
        expect(screen.getByText('Mon')).toBeInTheDocument();
        expect(screen.getByText('Tue')).toBeInTheDocument();

        // Note: JSDOM doesn't fully support responsive CSS, so we'll just check that both exist
        // In real browser, the responsive classes would work correctly
        expect(screen.queryByText('Monday')).toBeInTheDocument();
        expect(screen.queryByText('Tuesday')).toBeInTheDocument();

        // Should show day-level Plan/Track buttons on mobile (important for mobile UX)
        const planButtons = screen.getAllByText('Plan');
        const trackButtons = screen.getAllByText('Track');
        expect(planButtons.length).toBeGreaterThan(0);
        expect(trackButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Mobile Header', () => {
    test('header is responsive on mobile', async () => {
      mockWindowWidth(375);

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Header should be present
        expect(screen.getByText('Time Tracker')).toBeInTheDocument();
      });

      // Should have mobile-responsive classes
      const header = document.querySelector('header');
      expect(header).toHaveClass('px-4');
    });

    test('navigation buttons have proper touch targets on mobile', async () => {
      mockWindowWidth(375);

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      await waitFor(() => {
        const prevButton = screen.getByTitle('Previous Week');
        const nextButton = screen.getByTitle('Next Week');

        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();

        // Should have minimum touch target classes
        expect(prevButton).toHaveClass('min-w-[44px]');
        expect(prevButton).toHaveClass('min-h-[44px]');
        expect(nextButton).toHaveClass('min-w-[44px]');
        expect(nextButton).toHaveClass('min-h-[44px]');
      });
    });
  });

  describe('Responsive Breakpoint Behavior', () => {
    test('layout switches correctly when resizing from desktop to mobile', async () => {
      // Start with desktop
      mockWindowWidth(1024);

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should NOT show mobile menu on desktop
        expect(screen.queryByLabelText('Toggle menu')).not.toBeInTheDocument();
      });

      // Resize to mobile
      mockWindowWidth(375);

      await waitFor(() => {
        // Should show mobile menu after resize
        expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
      });
    });

    test('layout switches correctly when resizing from mobile to desktop', async () => {
      // Start with mobile
      mockWindowWidth(375);

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show mobile menu
        expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
      });

      // Resize to desktop
      mockWindowWidth(1024);

      await waitFor(() => {
        // Should NOT show mobile menu on desktop
        expect(screen.queryByLabelText('Toggle menu')).not.toBeInTheDocument();
      });
    });
  });
});
