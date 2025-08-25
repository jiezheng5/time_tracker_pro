'use client';

import { useMemo } from 'react';
import { TimeEntry } from '@/types';
import { format, startOfWeek, addDays } from 'date-fns';

interface WeeklyProgressChartProps {
  timeEntries: TimeEntry[];
  currentWeek: Date;
  className?: string;
}

export function WeeklyProgressChart({ 
  timeEntries, 
  currentWeek, 
  className = '' 
}: WeeklyProgressChartProps) {
  const weekData = useMemo(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
    const totalPossibleHours = 7 * 14; // 7 days * 14 hours (9am-11pm)
    
    // Count entries for each day of the week
    const dailyHours: Record<string, number> = {};
    let totalHours = 0;
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayString = format(day, 'yyyy-MM-dd');
      const dayEntries = timeEntries.filter(entry => entry.date === dayString);
      dailyHours[dayString] = dayEntries.length;
      totalHours += dayEntries.length;
    }
    
    const completionPercentage = Math.round((totalHours / totalPossibleHours) * 100);
    
    return {
      dailyHours,
      totalHours,
      totalPossibleHours,
      completionPercentage,
      weekStart,
    };
  }, [timeEntries, currentWeek]);

  const getDayName = (date: Date) => {
    return format(date, 'EEE'); // Mon, Tue, Wed, etc.
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDayProgressColor = (hours: number) => {
    const maxDayHours = 14; // 9am-11pm
    const percentage = (hours / maxDayHours) * 100;
    
    if (percentage >= 80) return 'bg-green-400';
    if (percentage >= 60) return 'bg-yellow-400';
    if (percentage >= 40) return 'bg-orange-400';
    if (percentage > 0) return 'bg-red-400';
    return 'bg-gray-200';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-4">Weekly Progress</h3>
      
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Overall Completion</span>
          <span className="text-sm font-medium text-gray-900">
            {weekData.totalHours}h / {weekData.totalPossibleHours}h ({weekData.completionPercentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(weekData.completionPercentage)}`}
            style={{ width: `${Math.min(weekData.completionPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Daily Breakdown */}
      <div>
        <h4 className="text-xs font-medium text-gray-700 mb-3">Daily Breakdown</h4>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const day = addDays(weekData.weekStart, i);
            const dayString = format(day, 'yyyy-MM-dd');
            const hours = weekData.dailyHours[dayString] || 0;
            const maxHours = 14;
            const percentage = (hours / maxHours) * 100;
            
            return (
              <div key={dayString} className="text-center">
                <div className="text-xs text-gray-500 mb-1">
                  {getDayName(day)}
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded h-16 flex items-end">
                    <div 
                      className={`w-full rounded transition-all duration-300 ${getDayProgressColor(hours)}`}
                      style={{ height: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {hours}h
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>80%+</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>60-79%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-400 rounded"></div>
              <span>40-59%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span>&lt;40%</span>
            </div>
          </div>
          <span>Daily completion rate</span>
        </div>
      </div>
    </div>
  );
}
