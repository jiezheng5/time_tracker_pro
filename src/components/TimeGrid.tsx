'use client';

import { BatchTimeEntryModal } from '@/components/BatchTimeEntryModal';
import { BatchPlannedEntryModal } from '@/components/BatchPlannedEntryModal';
import { Button } from '@/components/ui/Button';
import { PlannedEntryModal } from '@/components/PlannedEntryModal';
import { TimeEntryModal } from '@/components/TimeEntryModal';
import { TimeSlot } from '@/components/TimeSlot';
import { createWeekTimeSlots, formatHour, getWeekDays, isToday } from '@/lib/utils';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { WORK_HOURS } from '@/types';
import { useState } from 'react';

export function TimeGrid() {
  const { state, actions } = useTimeTracking();
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null);
  const [selectedPlanSlot, setSelectedPlanSlot] = useState<{ date: string; hour: number } | null>(null);
  const [multiSelectedSlots, setMultiSelectedSlots] = useState<Set<string>>(new Set());
  const [lastSelectedSlot, setLastSelectedSlot] = useState<{ date: string; hour: number } | null>(null);
  const [isBatchPlanModalOpen, setIsBatchPlanModalOpen] = useState(false);
  const [isBatchTrackModalOpen, setIsBatchTrackModalOpen] = useState(false);

  // Get current week data
  const weekDays = getWeekDays(state.currentWeek);
  const weekData = createWeekTimeSlots(weekDays, state.timeEntries, state.categories, state.plannedEntries);

  // Generate hour labels
  const hours = Array.from({ length: WORK_HOURS.TOTAL }, (_, i) => WORK_HOURS.START + i);

  const getSlotKey = (date: string, hour: number) => `${date}_${hour}`;

  const handleSlotClick = (date: string, hour: number, event: React.MouseEvent<HTMLDivElement>) => {
    const key = getSlotKey(date, hour);

    if (event.shiftKey && lastSelectedSlot) {
      const newSelection = new Set(multiSelectedSlots);
      const { date: lastDate, hour: lastHour } = lastSelectedSlot;


      // Only select within the same day for shift+click
      if (date === lastDate) {
        const [startHour, endHour] = [hour, lastHour].sort((a, b) => a - b);
        for (let h = startHour; h <= endHour; h++) {
          newSelection.add(getSlotKey(date, h));
        }
      }
      setMultiSelectedSlots(newSelection);
    } else if (event.metaKey || event.ctrlKey) {
      event.preventDefault();
      const newSelection = new Set(multiSelectedSlots);
      if (newSelection.has(key)) {
        newSelection.delete(key);
      } else {
        newSelection.add(key);
      }
      setMultiSelectedSlots(newSelection);
      setSelectedSlot(null);
      setSelectedPlanSlot(null);
    } else {
      setSelectedSlot({ date, hour });
      setMultiSelectedSlots(new Set());
    }
    setLastSelectedSlot({ date, hour });
  };


  const handlePlanSlotClick = (date: string, hour: number, event: React.MouseEvent<HTMLDivElement>) => {
    const key = getSlotKey(date, hour);

    if (event.shiftKey && lastSelectedSlot) {
      const newSelection = new Set(multiSelectedSlots);
      const { date: lastDate, hour: lastHour } = lastSelectedSlot;

      // Only select within the same day for shift+click
      if (date === lastDate) {
        const [startHour, endHour] = [hour, lastHour].sort((a, b) => a - b);
        for (let h = startHour; h <= endHour; h++) {
          newSelection.add(getSlotKey(date, h));
        }
      }
      setMultiSelectedSlots(newSelection);
    } else if (event.metaKey || event.ctrlKey) {
      event.preventDefault();
      const newSelection = new Set(multiSelectedSlots);
      if (newSelection.has(key)) {
        newSelection.delete(key);
      } else {
        newSelection.add(key);
      }
      setMultiSelectedSlots(newSelection);
      setSelectedSlot(null);
      setSelectedPlanSlot(null);
    } else {
      setSelectedPlanSlot({ date, hour });
      setMultiSelectedSlots(new Set());
    }
    setLastSelectedSlot({ date, hour });
  };

  const handleClearCell = async (date: string, hour: number) => {
    if (!confirm('Are you sure you want to clear this time slot? This action cannot be undone.')) {
      return;
    }

    try {
      await actions.clearCellData(date, hour);
    } catch (error) {
      console.error('Failed to clear cell data:', error);
    }
  };

  const handleBatchSelectDay = (date: string) => {
    const newSelection = new Set<string>();
    for (let hour = WORK_HOURS.START; hour <= WORK_HOURS.END; hour++) {
      newSelection.add(getSlotKey(date, hour));
    }
    setMultiSelectedSlots(newSelection);
  };

  const handleCloseModal = () => {
    setSelectedSlot(null);
  };

  const handleClosePlanModal = () => {
    setSelectedPlanSlot(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Weekly Time Grid</h2>
        <p className="text-sm text-gray-600 mt-1">
          Click any time slot to add or edit an activity
        </p>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Grid Header - Days */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            {/* Empty corner cell */}
            <div className="p-3 bg-gray-50 border-r border-gray-200">
              <span className="text-xs font-medium text-gray-500">Time</span>
            </div>

            {/* Day headers */}
            {weekData.map((day) => (
              <div
                key={day.date}
                className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${isToday(day.dateObj) ? 'bg-primary-50' : 'bg-gray-50'
                  }`}
              >
                <div className="text-sm font-medium text-gray-900">
                  {day.dayName}
                </div>
                <div className={`text-xs mt-1 ${isToday(day.dateObj) ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                  {day.dateObj.getDate()}
                </div>
                <div className="flex justify-center gap-2 mt-1">
                  <button
                    onClick={() => {
                      handleBatchSelectDay(day.date);
                      setIsBatchPlanModalOpen(true);
                    }}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Plan
                  </button>
                  <button
                    onClick={() => {
                      handleBatchSelectDay(day.date);
                      setIsBatchTrackModalOpen(true);
                    }}
                    className="text-xs text-green-500 hover:underline"
                  >
                    Track
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Grid Body - Time Slots */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
              {/* Hour label */}
              <div className="p-3 bg-gray-50 border-r border-gray-200 flex items-center">
                <span className="text-xs font-medium text-gray-600">
                  {formatHour(hour)}
                </span>
              </div>

              {/* Time slots for each day */}
              {weekData.map((day) => {
                const timeSlot = day.timeSlots.find(slot => slot.hour === hour);
                const slotKey = getSlotKey(day.date, hour);
                return (
                  <TimeSlot
                    key={slotKey}
                    timeSlot={timeSlot!}
                    onClick={(e) => handleSlotClick(day.date, hour, e)}
                    onPlanClick={(e) => handlePlanSlotClick(day.date, hour, e)}
                    onClearCell={() => handleClearCell(day.date, hour)}
                    isToday={isToday(day.dateObj)}
                    showPlanSection={true}
                    isSelected={multiSelectedSlots.has(slotKey)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Batch Action Bar */}
      {multiSelectedSlots.size > 1 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg p-3 flex items-center gap-4 z-50 border border-gray-200">
          <span className="text-sm font-medium text-gray-800">
            {multiSelectedSlots.size} slots selected
          </span>
          <Button onClick={() => setIsBatchPlanModalOpen(true)}>
            Plan for Selected
          </Button>
          <Button onClick={() => setIsBatchTrackModalOpen(true)} variant="outline">
            Track for Selected
          </Button>
          <Button variant="secondary" onClick={() => setMultiSelectedSlots(new Set())}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* Time Entry Modal */}
      {selectedSlot && (
        <TimeEntryModal
          date={selectedSlot.date}
          hour={selectedSlot.hour}
          onClose={handleCloseModal}
        />
      )}

      {/* Planned Entry Modal */}
      {selectedPlanSlot && (
        <PlannedEntryModal
          date={selectedPlanSlot.date}
          hour={selectedPlanSlot.hour}
          onClose={handleClosePlanModal}
        />
      )}

      {/* Batch Plan Modal */}
      {isBatchPlanModalOpen && (
        <BatchPlannedEntryModal
          selectedSlots={Array.from(multiSelectedSlots).map(key => {
            const [date, hour] = key.split('_');
            return { date, hour: parseInt(hour, 10) };
          })}
          onClose={() => {
            setIsBatchPlanModalOpen(false);
            setMultiSelectedSlots(new Set());
          }}
        />
      )}

      {/* Batch Track Modal */}
      {isBatchTrackModalOpen && (
        <BatchTimeEntryModal
          selectedSlots={Array.from(multiSelectedSlots).map(key => {
            const [date, hour] = key.split('_');
            return { date, hour: parseInt(hour, 10) };
          })}
          onClose={() => {
            setIsBatchTrackModalOpen(false);
            setMultiSelectedSlots(new Set());
          }}
        />
      )}
    </div>
  );
}