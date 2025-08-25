'use client';

import { useState } from 'react';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { getWeekDays, createWeekTimeSlots, formatHour, isToday } from '@/lib/utils';
import { WORK_HOURS } from '@/types';
import { TimeSlot } from '@/components/TimeSlot';
import { TimeEntryModal } from '@/components/TimeEntryModal';

export function TimeGrid() {
  const { state } = useTimeTracking();
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null);

  // Get current week data
  const weekDays = getWeekDays(state.currentWeek);
  const weekData = createWeekTimeSlots(weekDays, state.timeEntries, state.categories);

  // Generate hour labels
  const hours = Array.from({ length: WORK_HOURS.TOTAL }, (_, i) => WORK_HOURS.START + i);

  const handleSlotClick = (date: string, hour: number) => {
    setSelectedSlot({ date, hour });
  };

  const handleCloseModal = () => {
    setSelectedSlot(null);
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
                className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
                  isToday(new Date(day.date)) ? 'bg-primary-50' : 'bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium text-gray-900">
                  {day.dayName}
                </div>
                <div className={`text-xs mt-1 ${
                  isToday(new Date(day.date)) ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {new Date(day.date).getDate()}
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
                return (
                  <TimeSlot
                    key={`${day.date}-${hour}`}
                    timeSlot={timeSlot!}
                    onClick={() => handleSlotClick(day.date, hour)}
                    isToday={isToday(new Date(day.date))}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Time Entry Modal */}
      {selectedSlot && (
        <TimeEntryModal
          date={selectedSlot.date}
          hour={selectedSlot.hour}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
