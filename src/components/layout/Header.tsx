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
            title="Previous Week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex flex-col items-center space-y-2">
            <div className="text-lg font-semibold text-gray-900">
              {getWeekString(state.currentWeek)}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToday}
                className="text-xs text-primary-600 hover:text-primary-700"
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
            className="p-2"
            title="Next Week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearWeek}
            disabled={isClearing}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Clear all entries for this week"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear Week'}
          </Button>
          <ExportButton />
        </div>
      </div>
    </header>
  );
}
