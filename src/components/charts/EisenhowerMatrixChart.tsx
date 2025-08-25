'use client';

import { useMemo } from 'react';
import { TimeEntry } from '@/types';

interface EisenhowerMatrixChartProps {
  timeEntries: TimeEntry[];
  className?: string;
}

export function EisenhowerMatrixChart({ 
  timeEntries, 
  className = '' 
}: EisenhowerMatrixChartProps) {
  const matrixData = useMemo(() => {
    const quadrants = {
      q1: { count: 0, label: 'Do First', symbol: '🔥', color: 'bg-red-100 border-red-300 text-red-800' },
      q2: { count: 0, label: 'Schedule', symbol: '⭐', color: 'bg-green-100 border-green-300 text-green-800' },
      q3: { count: 0, label: 'Delegate', symbol: '⚡', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
      q4: { count: 0, label: 'Eliminate', symbol: '💤', color: 'bg-gray-100 border-gray-300 text-gray-800' },
    };

    timeEntries.forEach(entry => {
      if (entry.isImportant && entry.isUrgent) {
        quadrants.q1.count++;
      } else if (entry.isImportant && !entry.isUrgent) {
        quadrants.q2.count++;
      } else if (!entry.isImportant && entry.isUrgent) {
        quadrants.q3.count++;
      } else {
        quadrants.q4.count++;
      }
    });

    const totalEntries = timeEntries.length;
    
    return {
      quadrants,
      totalEntries,
    };
  }, [timeEntries]);

  const getPercentage = (count: number) => {
    if (matrixData.totalEntries === 0) return 0;
    return Math.round((count / matrixData.totalEntries) * 100);
  };

  if (matrixData.totalEntries === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-sm text-gray-500">No time entries yet</p>
          <p className="text-xs text-gray-400">Add some time entries to see the priority distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-4">Priority Distribution (Eisenhower Matrix)</h3>
      
      {/* Matrix Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Q1: Important + Urgent */}
        <div className={`p-4 rounded-lg border-2 ${matrixData.quadrants.q1.color}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{matrixData.quadrants.q1.symbol}</span>
              <span className="text-sm font-medium">{matrixData.quadrants.q1.label}</span>
            </div>
            <span className="text-xs font-medium">Q1</span>
          </div>
          <div className="text-lg font-bold">{matrixData.quadrants.q1.count}h</div>
          <div className="text-xs opacity-75">{getPercentage(matrixData.quadrants.q1.count)}%</div>
          <div className="text-xs mt-1 opacity-75">Important + Urgent</div>
        </div>

        {/* Q2: Important + Not Urgent */}
        <div className={`p-4 rounded-lg border-2 ${matrixData.quadrants.q2.color}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{matrixData.quadrants.q2.symbol}</span>
              <span className="text-sm font-medium">{matrixData.quadrants.q2.label}</span>
            </div>
            <span className="text-xs font-medium">Q2</span>
          </div>
          <div className="text-lg font-bold">{matrixData.quadrants.q2.count}h</div>
          <div className="text-xs opacity-75">{getPercentage(matrixData.quadrants.q2.count)}%</div>
          <div className="text-xs mt-1 opacity-75">Important + Not Urgent</div>
        </div>

        {/* Q3: Not Important + Urgent */}
        <div className={`p-4 rounded-lg border-2 ${matrixData.quadrants.q3.color}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{matrixData.quadrants.q3.symbol}</span>
              <span className="text-sm font-medium">{matrixData.quadrants.q3.label}</span>
            </div>
            <span className="text-xs font-medium">Q3</span>
          </div>
          <div className="text-lg font-bold">{matrixData.quadrants.q3.count}h</div>
          <div className="text-xs opacity-75">{getPercentage(matrixData.quadrants.q3.count)}%</div>
          <div className="text-xs mt-1 opacity-75">Not Important + Urgent</div>
        </div>

        {/* Q4: Not Important + Not Urgent */}
        <div className={`p-4 rounded-lg border-2 ${matrixData.quadrants.q4.color}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{matrixData.quadrants.q4.symbol}</span>
              <span className="text-sm font-medium">{matrixData.quadrants.q4.label}</span>
            </div>
            <span className="text-xs font-medium">Q4</span>
          </div>
          <div className="text-lg font-bold">{matrixData.quadrants.q4.count}h</div>
          <div className="text-xs opacity-75">{getPercentage(matrixData.quadrants.q4.count)}%</div>
          <div className="text-xs mt-1 opacity-75">Not Important + Not Urgent</div>
        </div>
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Total Time Tracked:</span>
          <span className="font-medium text-gray-900">{matrixData.totalEntries} hours</span>
        </div>
        
        {/* Recommendations */}
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-xs font-medium text-blue-900 mb-1">💡 Recommendations</h4>
          <div className="text-xs text-blue-800 space-y-1">
            {getPercentage(matrixData.quadrants.q1.count) > 30 && (
              <div>• Too much time in Q1 (crisis mode) - try to prevent urgent tasks</div>
            )}
            {getPercentage(matrixData.quadrants.q2.count) < 30 && (
              <div>• Increase Q2 time (important planning) for better long-term results</div>
            )}
            {getPercentage(matrixData.quadrants.q3.count) > 20 && (
              <div>• Consider delegating Q3 tasks (urgent but not important)</div>
            )}
            {getPercentage(matrixData.quadrants.q4.count) > 25 && (
              <div>• Reduce Q4 time (time wasters) to focus on important work</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
