'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TimeGrid } from '@/components/TimeGrid';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ResizablePanel } from '@/components/ui/ResizablePanel';
import { useTimeTracking } from '@/stores/TimeTrackingContext';

export default function HomePage() {
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
        <ResizablePanel
          defaultWidth={320}
          minWidth={250}
          maxWidth={600}
          storageKey="sidebar-width"
        >
          <Sidebar />
        </ResizablePanel>

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <TimeGrid />
          </div>
        </main>
      </div>
    </div>
  );
}
