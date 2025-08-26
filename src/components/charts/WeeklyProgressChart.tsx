'use client';

import { formatDateString, getShortDayName } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { TimeEntry } from '@/types';
import { addDays, startOfWeek } from 'date-fns';
import { Download } from 'lucide-react';
import { useMemo } from 'react';

interface WeeklyProgressChartProps {
  timeEntries: TimeEntry[];
  currentWeek: Date;
  className?: string;
  containerWidth?: number;
}

export default function WeeklyProgressChart({
  timeEntries,
  currentWeek,
  className = '',
  containerWidth = 320
}: WeeklyProgressChartProps) {
  const weekData = useMemo(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
    const totalPossibleHours = 7 * 14; // 7 days * 14 hours (9am-11pm)

    // Count entries for each day of the week
    const dailyHours: Record<string, number> = {};
    let totalHours = 0;

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayString = formatDateString(day);
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
    return getShortDayName(date);
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

  const exportDataAsCSV = () => {
    const csvData = Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekData.weekStart, i);
      const dayString = formatDateString(day);
      const hours = weekData.dailyHours[dayString] || 0;
      return {
        Date: dayString,
        Day: getDayName(day),
        Hours: hours,
        MaxHours: 14,
        Percentage: ((hours / 14) * 100).toFixed(1)
      };
    });

    const csvContent = [
      ['Date', 'Day', 'Hours', 'MaxHours', 'Percentage'].join(','),
      ...csvData.map(row => [row.Date, row.Day, row.Hours, row.MaxHours, row.Percentage].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'weekly-progress-data.csv';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("bg-white p-4 rounded-lg shadow", className)}>
      <div className={cn("space-y-4", containerWidth < 350 && "space-y-3")}>
        {/* Header with export button */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className={cn(
            "font-medium text-gray-900",
            containerWidth < 350 ? "text-xs" : "text-sm"
          )}>Weekly Progress</h3>
          <button
            className={cn(
              "p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors",
              containerWidth < 350 && "p-1"
            )}
            onClick={exportDataAsCSV}
            title="Export data as CSV"
          >
            <Download className={cn("w-4 h-4", containerWidth < 350 && "w-3.5 h-3.5")} />
          </button>
        </div>

        {/* Overall Progress */}
        <div className={cn("mb-6", containerWidth < 350 && "mb-4")}>
          <div className="flex justify-between items-center mb-2">
            <span className={cn(
              "text-gray-600",
              containerWidth < 350 ? "text-xs" : "text-sm"
            )}>Overall Completion</span>
            <span className={cn(
              "font-medium text-gray-900",
              containerWidth < 350 ? "text-xs" : "text-sm"
            )}>
              {`${weekData.totalHours}h / ${weekData.totalPossibleHours}h (${weekData.completionPercentage}%)`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={cn(
                "rounded-full transition-all duration-300 h-2.5",
                getProgressColor(weekData.completionPercentage)
              )}
              style={{ width: `${Math.min(weekData.completionPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Daily Breakdown */}
        <div>
          <h4 className={cn(
            "font-medium text-gray-700 mb-3",
            containerWidth < 350 ? "text-xs mb-2" : "text-sm"
          )}>Daily Breakdown</h4>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }, (_, i) => {
              const day = addDays(weekData.weekStart, i);
              const dayString = formatDateString(day);
              const hours = weekData.dailyHours[dayString] || 0;
              const maxHours = 14;
              const percentage = (hours / maxHours) * 100;

              return (
                <div key={dayString} className="text-center">
                  <div className={cn(
                    "text-gray-500 mb-1",
                    containerWidth < 350 ? "text-[10px]" : "text-xs"
                  )}>
                    {getDayName(day)}
                  </div>
                  <div className="relative">
                    <div className={cn(
                      "w-full bg-gray-200 rounded flex items-end",
                      containerWidth < 350 ? "h-12" : "h-16"
                    )}>
                      <div
                        className={cn(
                          "w-full rounded transition-all duration-300",
                          getDayProgressColor(hours)
                        )}
                        style={{ height: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                    <div className={cn(
                      "text-gray-600 mt-1",
                      containerWidth < 350 ? "text-[10px]" : "text-xs"
                    )}>
                      {`${hours}h`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className={cn(
          "mt-4 pt-4 border-t border-gray-100",
          containerWidth < 350 && "mt-3 pt-3"
        )}>
          <div className={cn(
            "flex items-center justify-between text-gray-500",
            containerWidth < 350 ? "text-[10px]" : "text-xs"
          )}>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-green-400 rounded"></div>
                <span>80%+</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded"></div>
                <span>60-79%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-orange-400 rounded"></div>
                <span>40-59%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-red-400 rounded"></div>
                <span>&lt;40%</span>
              </div>
            </div>
            <span className="hidden sm:inline">Daily completion rate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
