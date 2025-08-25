'use client';

import { cn } from '@/lib/utils';
import { addWeeks, format, startOfWeek, subWeeks } from 'date-fns';
import { Calendar, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
    setSelectedDate(weekStart);
    onChange(weekStart);
    setIsOpen(false);
  };

  const getQuickOptions = () => {
    const today = new Date();
    const thisWeek = startOfWeek(today, { weekStartsOn: 1 });

    return [
      { label: 'This Week', date: thisWeek },
      { label: 'Next Week', date: addWeeks(thisWeek, 1) },
      { label: 'Last Week', date: subWeeks(thisWeek, 1) },
      { label: 'Next Month', date: addWeeks(thisWeek, 4) },
      { label: 'Last Month', date: subWeeks(thisWeek, 4) },
    ];
  };

  const generateCalendarDays = () => {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    // Get first day of the month and adjust to Monday start
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = startOfWeek(firstDay, { weekStartsOn: 1 });

    const days = [];
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date) => {
    return date.getMonth() === selectedDate.getMonth();
  };

  const isSelectedWeek = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const currentWeekStart = startOfWeek(value, { weekStartsOn: 1 });
    return weekStart.getTime() === currentWeekStart.getTime();
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
      >
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-gray-700">
          Week of {format(startOfWeek(value, { weekStartsOn: 1 }), 'MMM d, yyyy')}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[320px]">
          {/* Quick Options */}
          <div className="p-3 border-b border-gray-200">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Quick Select</h4>
            <div className="space-y-1">
              {getQuickOptions().map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleDateSelect(option.date)}
                  className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="p-3">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>
              <h4 className="text-sm font-medium text-gray-900">
                {format(selectedDate, 'MMMM yyyy')}
              </h4>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((date, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    'text-sm p-2 rounded transition-colors',
                    isSameMonth(date) ? 'text-gray-900' : 'text-gray-400',
                    isToday(date) && 'bg-primary-100 text-primary-700 font-medium',
                    isSelectedWeek(date) && 'bg-primary-500 text-white',
                    !isSelectedWeek(date) && !isToday(date) && 'hover:bg-gray-100'
                  )}
                >
                  {date.getDate()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
