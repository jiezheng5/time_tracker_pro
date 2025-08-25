'use client';

import { useMemo } from 'react';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { getWeekDays, formatDateString, calculatePercentage } from '@/lib/utils';
import { WEEK_HOURS, EisenhowerQuadrant } from '@/types';
import { Clock, Target, TrendingUp, Calendar } from 'lucide-react';

export function QuickStats() {
  const { state } = useTimeTracking();

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

  const getQuadrantLabel = (quadrant: EisenhowerQuadrant) => {
    switch (quadrant) {
      case EisenhowerQuadrant.IMPORTANT_URGENT:
        return 'Do First';
      case EisenhowerQuadrant.IMPORTANT_NOT_URGENT:
        return 'Schedule';
      case EisenhowerQuadrant.NOT_IMPORTANT_URGENT:
        return 'Delegate';
      case EisenhowerQuadrant.NOT_IMPORTANT_NOT_URGENT:
        return 'Eliminate';
    }
  };

  const getQuadrantColor = (quadrant: EisenhowerQuadrant) => {
    switch (quadrant) {
      case EisenhowerQuadrant.IMPORTANT_URGENT:
        return 'text-red-600 bg-red-50';
      case EisenhowerQuadrant.IMPORTANT_NOT_URGENT:
        return 'text-green-600 bg-green-50';
      case EisenhowerQuadrant.NOT_IMPORTANT_URGENT:
        return 'text-yellow-600 bg-yellow-50';
      case EisenhowerQuadrant.NOT_IMPORTANT_NOT_URGENT:
        return 'text-gray-600 bg-gray-50';
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
          {Object.entries(weekStats.quadrantStats).map(([quadrant, hours]) => (
            <div key={quadrant} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${getQuadrantColor(quadrant as EisenhowerQuadrant).split(' ')[1]}`} />
                <span className="text-xs text-gray-700">
                  {getQuadrantLabel(quadrant as EisenhowerQuadrant)}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-900">
                {hours}h
              </span>
            </div>
          ))}
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
    </div>
  );
}
