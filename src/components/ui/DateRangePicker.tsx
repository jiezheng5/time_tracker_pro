'use client';

import { Calendar, X } from 'lucide-react';
import { useState } from 'react';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onClear: () => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
  onClear,
  className = ''
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate?.toISOString().split('T')[0] || '');
  const [tempEndDate, setTempEndDate] = useState(endDate?.toISOString().split('T')[0] || '');

  const hasDateRange = startDate && endDate;

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      const start = new Date(tempStartDate);
      const end = new Date(tempEndDate);

      // Ensure start is before end
      if (start <= end) {
        onDateRangeChange(start, end);
        setIsOpen(false);
      }
    }
  };

  const handleClear = () => {
    setTempStartDate('');
    setTempEndDate('');
    onClear();
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Reset temp values to current values
    setTempStartDate(startDate?.toISOString().split('T')[0] || '');
    setTempEndDate(endDate?.toISOString().split('T')[0] || '');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <div className="flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-colors ${hasDateRange
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            } ${hasDateRange ? 'rounded-r-none border-r-0' : ''}`}
        >
          <Calendar className="w-4 h-4" />
          {hasDateRange ? (
            <span>
              {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
            </span>
          ) : (
            <span>Select date range</span>
          )}
        </button>
        {hasDateRange && (
          <button
            onClick={handleClear}
            className="px-2 py-2 text-sm bg-blue-50 border border-blue-200 border-l-0 text-blue-700 hover:bg-blue-100 rounded-r-md"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4 min-w-[300px]">
          <div className="space-y-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                min={tempStartDate} // Ensure end date is after start date
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Select
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastWeek = new Date(today);
                    lastWeek.setDate(today.getDate() - 7);
                    setTempStartDate(lastWeek.toISOString().split('T')[0]);
                    setTempEndDate(today.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today);
                    lastMonth.setDate(today.getDate() - 30);
                    setTempStartDate(lastMonth.toISOString().split('T')[0]);
                    setTempEndDate(today.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Last 30 days
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    setTempStartDate(startOfMonth.toISOString().split('T')[0]);
                    setTempEndDate(today.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  This month
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                    setTempStartDate(lastMonth.toISOString().split('T')[0]);
                    setTempEndDate(endOfLastMonth.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Last month
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <button
                onClick={handleClear}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!tempStartDate || !tempEndDate}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
