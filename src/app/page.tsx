'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TimeGrid } from '@/components/TimeGrid';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ResizablePanel } from '@/components/ui/ResizablePanel';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { useTimeTracking } from '@/stores/TimeTrackingContext';

function MainLayout() {
  const { activeTab } = useSidebar();
  const { state } = useTimeTracking();

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
