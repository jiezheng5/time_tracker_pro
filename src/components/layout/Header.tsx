'use client';

import { ExportButton } from '@/components/ExportButton';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { getCurrentPacificDate, getNextWeek, getPreviousWeek, getWeekString } from '@/lib/utils';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { ChevronLeft, ChevronRight, Clock, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { state, actions } = useTimeTracking();
  const [isClearing, setIsClearing] = useState(false);

  const handlePreviousWeek = () => {
    const previousWeek = getPreviousWeek(state.currentWeek);
    actions.setCurrentWeek(previousWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = getNextWeek(state.currentWeek);
    actions.setCurrentWeek(nextWeek);
  };

  const handleToday = () => {
    actions.setCurrentWeek(getCurrentPacificDate());
  };

  const handleClearWeek = async () => {
    if (!confirm('Are you sure you want to clear all time entries for this week? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await actions.clearWeekData(state.currentWeek);
    } catch (error) {
      console.error('Failed to clear week data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Title - Mobile Optimized */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-primary-500 rounded-lg">
            <Clock className="h-4 w-4 md:h-6 md:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Time Tracker</h1>
            <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Eisenhower Matrix</p>
          </div>
        </div>

        {/* Week Navigation - Mobile Optimized */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousWeek}
            className="p-1.5 md:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Previous Week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex flex-col items-center space-y-1 md:space-y-2">
            <div className="text-sm md:text-lg font-semibold text-gray-900 text-center">
              {/* Mobile: Show shorter week format */}
              <span className="md:hidden">{getWeekString(state.currentWeek).split(' - ')[0].slice(-5)}</span>
              <span className="hidden md:inline">{getWeekString(state.currentWeek)}</span>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToday}
                className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 min-h-[32px]"
              >
                Today
              </Button>
              <DatePicker
                value={state.currentWeek}
                onChange={actions.setCurrentWeek}
                className="text-xs"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextWeek}
            className="p-1.5 md:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Next Week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions - Mobile Optimized */}
        <div className="flex items-center space-x-1 md:space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearWeek}
            disabled={isClearing}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 min-w-[44px] min-h-[44px] px-2 md:px-3"
            title="Clear all entries for this week"
          >
            <Trash2 className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">
              {isClearing ? 'Clearing...' : 'Clear Week'}
            </span>
          </Button>
          <ExportButton />
        </div>
      </div>
    </header>
  );
}
