'use client';

import { calculatePercentage, formatDateString, getWeekDays } from '@/lib/utils';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { EisenhowerQuadrant, WEEK_HOURS } from '@/types';
import { Calendar, Clock, Target, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { CategoryDistributionChart } from './charts/CategoryDistributionChart';
import { EisenhowerMatrixChart } from './charts/EisenhowerMatrixChart';
import { WeeklyProgressChart } from './charts/WeeklyProgressChart';

export function QuickStats() {
  const { state } = useTimeTracking();

  // Get current week entries for charts
  const weekDays = getWeekDays(state.currentWeek);
  const weekDateStrings = weekDays.map(formatDateString);
  const currentWeekEntries = state.timeEntries.filter(entry =>
    weekDateStrings.includes(entry.date)
  );

  const weekStats = useMemo(() => {
    const weekDays = getWeekDays(state.currentWeek);
    const weekDateStrings = weekDays.map(formatDateString);

    // Filter entries for current week
    const weekEntries = state.timeEntries.filter(entry =>
      weekDateStrings.includes(entry.date)
    );

    const totalTracked = weekEntries.length;
    const trackingPercentage = calculatePercentage(totalTracked, WEEK_HOURS);

    // Category distribution
    const categoryStats = state.categories.map(category => {
      const categoryEntries = weekEntries.filter(entry => entry.categoryId === category.id);
      return {
        category,
        hours: categoryEntries.length,
        percentage: calculatePercentage(categoryEntries.length, totalTracked),
      };
    }).filter(stat => stat.hours > 0)
      .sort((a, b) => b.hours - a.hours);

    // Quadrant distribution
    const quadrantStats = {
      [EisenhowerQuadrant.IMPORTANT_URGENT]: weekEntries.filter(e => e.isImportant && e.isUrgent).length,
      [EisenhowerQuadrant.IMPORTANT_NOT_URGENT]: weekEntries.filter(e => e.isImportant && !e.isUrgent).length,
      [EisenhowerQuadrant.NOT_IMPORTANT_URGENT]: weekEntries.filter(e => !e.isImportant && e.isUrgent).length,
      [EisenhowerQuadrant.NOT_IMPORTANT_NOT_URGENT]: weekEntries.filter(e => !e.isImportant && !e.isUrgent).length,
    };

    const mostUsedCategory = categoryStats[0]?.category;

    return {
      totalTracked,
      trackingPercentage,
      categoryStats,
      quadrantStats,
      mostUsedCategory,
    };
  }, [state.timeEntries, state.categories, state.currentWeek]);

  const getQuadrantInfo = (quadrant: EisenhowerQuadrant) => {
    switch (quadrant) {
      case EisenhowerQuadrant.IMPORTANT_URGENT:
        return { symbol: '🔥', label: 'Do First', color: 'text-red-600 bg-red-50' };
      case EisenhowerQuadrant.IMPORTANT_NOT_URGENT:
        return { symbol: '⭐', label: 'Schedule', color: 'text-green-600 bg-green-50' };
      case EisenhowerQuadrant.NOT_IMPORTANT_URGENT:
        return { symbol: '⚡', label: 'Delegate', color: 'text-yellow-600 bg-yellow-50' };
      case EisenhowerQuadrant.NOT_IMPORTANT_NOT_URGENT:
        return { symbol: '💤', label: 'Eliminate', color: 'text-gray-600 bg-gray-50' };
    }
  };



  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-primary-500 mr-2" />
            <span className="text-sm font-medium text-gray-900">This Week</span>
          </div>
          <span className="text-lg font-bold text-primary-600">
            {weekStats.trackingPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${weekStats.trackingPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {weekStats.totalTracked} of {WEEK_HOURS} hours tracked
        </p>
      </div>

      {/* Most Used Category */}
      {weekStats.mostUsedCategory && (
        <div className="card p-4">
          <div className="flex items-center mb-2">
            <Target className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-900">Top Category</span>
          </div>
          <div className="flex items-center">
            <div
              className="category-color-dot"
              style={{ backgroundColor: weekStats.mostUsedCategory.color }}
            />
            <span className="text-sm text-gray-900">{weekStats.mostUsedCategory.name}</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {weekStats.categoryStats[0].hours} hours ({weekStats.categoryStats[0].percentage}%)
          </p>
        </div>
      )}

      {/* Eisenhower Matrix Summary */}
      <div className="card p-4">
        <div className="flex items-center mb-3">
          <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
          <span className="text-sm font-medium text-gray-900">Priority Matrix</span>
        </div>
        <div className="space-y-2">
          {Object.entries(weekStats.quadrantStats).map(([quadrant, hours]) => {
            const quadrantInfo = getQuadrantInfo(quadrant as EisenhowerQuadrant);
            return (
              <div key={quadrant} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm mr-2">{quadrantInfo.symbol}</span>
                  <span className="text-xs text-gray-700">
                    {quadrantInfo.label}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-900">
                  {hours}h
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      {weekStats.categoryStats.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center mb-3">
            <Calendar className="h-4 w-4 text-purple-500 mr-2" />
            <span className="text-sm font-medium text-gray-900">Categories</span>
          </div>
          <div className="space-y-2">
            {weekStats.categoryStats.slice(0, 5).map((stat) => (
              <div key={stat.category.id} className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <div
                    className="category-color-dot flex-shrink-0"
                    style={{ backgroundColor: stat.category.color }}
                  />
                  <span className="text-xs text-gray-700 truncate">
                    {stat.category.name}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-900 ml-2">
                  {stat.hours}h
                </span>
              </div>
            ))}
            {weekStats.categoryStats.length > 5 && (
              <p className="text-xs text-gray-500 text-center pt-1">
                +{weekStats.categoryStats.length - 5} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="space-y-4">
        {/* Weekly Progress Chart */}
        <WeeklyProgressChart
          timeEntries={currentWeekEntries}
          currentWeek={state.currentWeek}
        />

        {/* Category Distribution Chart */}
        <CategoryDistributionChart
          timeEntries={currentWeekEntries}
          categories={state.categories}
        />

        {/* Eisenhower Matrix Chart */}
        <EisenhowerMatrixChart
          timeEntries={currentWeekEntries}
        />
      </div>
    </div>
  );
}
