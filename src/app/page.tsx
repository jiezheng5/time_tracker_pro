'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TimeGrid } from '@/components/TimeGrid';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ResizablePanel } from '@/components/ui/ResizablePanel';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

function MainLayout() {
  const { activeTab } = useSidebar();
  const { state } = useTimeTracking();

  // Mobile state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when switching tabs
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={state.error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mobile Layout */}
      {isMobile ? (
        <div className="h-[calc(100vh-73px)] flex flex-col">
          {/* Mobile Menu Button */}
          <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200 md:hidden">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'stats' ? 'Statistics' : 'Categories'}
            </h2>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="fixed top-[73px] left-0 w-80 h-[calc(100vh-73px)] bg-white z-50 transform transition-transform duration-300 ease-in-out">
                <Sidebar />
              </div>
            </>
          )}

          {/* Mobile Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4">
              <TimeGrid />
            </div>
          </main>
        </div>
      ) : (
        /* Desktop Layout - Existing Functionality Preserved */
        <div className="flex h-[calc(100vh-73px)]">
          {activeTab === 'stats' ? (
            // Stats Layout: Resizable stats panel
            <>
              <ResizablePanel
                defaultWidth={450}
                minWidth={350}
                maxWidth={800}
                storageKey="stats-panel-width"
              >
                <div className="h-full bg-white">
                  <Sidebar />
                </div>
              </ResizablePanel>
              <main className="flex-1 p-6 overflow-auto">
                <div className="max-w-7xl mx-auto">
                  <TimeGrid />
                </div>
              </main>
            </>
          ) : (
            // Categories Layout: Standard sidebar
            <>
              <ResizablePanel
                defaultWidth={320}
                minWidth={250}
                maxWidth={500}
                storageKey="sidebar-width"
              >
                <Sidebar />
              </ResizablePanel>
              <main className="flex-1 p-6 overflow-auto">
                <div className="max-w-7xl mx-auto">
                  <TimeGrid />
                </div>
              </main>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <SidebarProvider>
      <MainLayout />
    </SidebarProvider>
  );
}
