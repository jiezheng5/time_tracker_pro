'use client';

import { ExportButton } from '@/components/ExportButton';
import { Button } from '@/components/ui/Button';
import { getNextWeek, getPreviousWeek, getWeekString } from '@/lib/utils';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export function Header() {
  const { state, actions } = useTimeTracking();

  const handlePreviousWeek = () => {
    const previousWeek = getPreviousWeek(state.currentWeek);
    actions.setCurrentWeek(previousWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = getNextWeek(state.currentWeek);
    actions.setCurrentWeek(nextWeek);
  };

  const handleToday = () => {
    actions.setCurrentWeek(new Date());
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-lg">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Time Tracker</h1>
            <p className="text-sm text-gray-600">Eisenhower Matrix</p>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousWeek}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center min-w-[200px]">
            <div className="text-lg font-semibold text-gray-900">
              {getWeekString(state.currentWeek)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Today
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextWeek}
            className="p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <ExportButton />
        </div>
      </div>
    </header>
  );
}
