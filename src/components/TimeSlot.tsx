'use client';

import { cn } from '@/lib/utils';
import { TimeSlotData } from '@/types';

// Utility function to get contrast color for text
function getContrastColor(backgroundColor: string): string {
  // Convert hex to RGB
  const r = parseInt(backgroundColor.slice(1, 3), 16);
  const g = parseInt(backgroundColor.slice(3, 5), 16);
  const b = parseInt(backgroundColor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

interface TimeSlotProps {
  timeSlot: TimeSlotData;
  onClick: () => void;
  onPlanClick?: () => void;
  isToday?: boolean;
  showPlanSection?: boolean; // Toggle for showing plan vs execute sections
}

export function TimeSlot({
  timeSlot,
  onClick,
  onPlanClick,
  isToday = false,
  showPlanSection = true
}: TimeSlotProps) {
  const { actualEntry, actualCategory, plannedEntry, plannedCategory } = timeSlot;
  const hasActualEntry = !!actualEntry;
  const hasPlannedEntry = !!plannedEntry;

  // Get Eisenhower quadrant info for actual entry
  const getQuadrantInfo = (entry?: { isImportant: boolean; isUrgent: boolean }) => {
    if (!entry) return null;

    if (entry.isImportant && entry.isUrgent) {
      return { symbol: '🔥', bgColor: '#ef4444', label: 'Q1: Do First' };
    } else if (entry.isImportant && !entry.isUrgent) {
      return { symbol: '⭐', bgColor: '#10b981', label: 'Q2: Schedule' };
    } else if (!entry.isImportant && entry.isUrgent) {
      return { symbol: '⚡', bgColor: '#f59e0b', label: 'Q3: Delegate' };
    } else {
      return { symbol: '💤', bgColor: '#6b7280', label: 'Q4: Eliminate' };
    }
  };

  const actualQuadrantInfo = getQuadrantInfo(actualEntry);
  const plannedQuadrantInfo = getQuadrantInfo(plannedEntry);

  // Determine execution status
  const getExecutionStatus = () => {
    if (hasPlannedEntry && hasActualEntry) {
      return plannedEntry.categoryId === actualEntry.categoryId ? 'completed' : 'different';
    } else if (hasPlannedEntry && !hasActualEntry) {
      return 'missed';
    } else if (!hasPlannedEntry && hasActualEntry) {
      return 'unplanned';
    }
    return 'empty';
  };

  const executionStatus = getExecutionStatus();

  if (!showPlanSection) {
    // Legacy single-section view (for backward compatibility)
    return (
      <div
        className={cn(
          'time-slot border-r border-gray-200 last:border-r-0 relative cursor-pointer transition-all duration-200',
          hasActualEntry ? 'filled' : '',
          isToday ? 'border-primary-200' : ''
        )}
        style={{
          backgroundColor: hasActualEntry && actualCategory ? actualCategory.color : undefined,
          color: hasActualEntry && actualCategory ? getContrastColor(actualCategory.color) : undefined,
        }}
        onClick={onClick}
      >
        <div className="p-2 h-full min-h-[60px] flex flex-col justify-between">
          {hasActualEntry && actualCategory && (
            <>
              <div className="text-xs font-medium truncate">{actualCategory.name}</div>
              {actualEntry.description && (
                <div className="text-xs opacity-80 truncate mt-1">{actualEntry.description}</div>
              )}
            </>
          )}
          {actualQuadrantInfo && (
            <div
              className="absolute top-1 right-1 flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shadow-sm"
              style={{ backgroundColor: actualQuadrantInfo.bgColor }}
              title={actualQuadrantInfo.label}
            >
              <span className="text-sm leading-none">{actualQuadrantInfo.symbol}</span>
            </div>
          )}
          {!hasActualEntry && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-gray-100 bg-opacity-50">
              <span className="text-xs text-gray-600 font-medium">+ Add</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dual-section view (plan | execute)
  return (
    <div
      className={cn(
        'time-slot border-r border-gray-200 last:border-r-0 relative transition-all duration-200',
        isToday ? 'border-primary-200' : '',
        // Execution status styling
        executionStatus === 'completed' && 'ring-2 ring-green-300',
        executionStatus === 'different' && 'ring-2 ring-yellow-300',
        executionStatus === 'missed' && 'ring-2 ring-red-300',
        executionStatus === 'unplanned' && 'ring-2 ring-blue-300'
      )}
    >
      <div className="flex h-full min-h-[60px] overflow-hidden">
        {/* Left Side - Planning Section */}
        <div
          className={cn(
            'w-1/2 border-r border-gray-300 relative cursor-pointer transition-all duration-200 hover:bg-gray-50 overflow-hidden',
            hasPlannedEntry && plannedCategory ? 'bg-opacity-30' : ''
          )}
          style={{
            backgroundColor: hasPlannedEntry && plannedCategory
              ? `${plannedCategory.color}20` // 20% opacity
              : undefined,
          }}
          onClick={onPlanClick}
        >
          <div className="p-1 h-full flex flex-col justify-between overflow-hidden">
            {hasPlannedEntry && plannedCategory ? (
              <>
                <div className="text-xs font-medium truncate text-gray-700 overflow-hidden">
                  {plannedCategory.name}
                </div>
                {plannedEntry.description && (
                  <div className="text-xs text-gray-600 truncate mt-1 overflow-hidden">
                    {plannedEntry.description}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-xs text-gray-400">Plan</span>
              </div>
            )}

            {/* Planned Priority Indicator */}
            {plannedQuadrantInfo && (
              <div
                className="absolute top-0.5 right-0.5 flex items-center justify-center w-4 h-4 rounded-full text-white text-xs font-bold shadow-sm opacity-70"
                style={{ backgroundColor: plannedQuadrantInfo.bgColor }}
                title={`Planned: ${plannedQuadrantInfo.label}`}
              >
                <span className="text-xs leading-none">{plannedQuadrantInfo.symbol}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Execution Section */}
        <div
          className={cn(
            'w-1/2 relative cursor-pointer transition-all duration-200 overflow-hidden',
            hasActualEntry ? 'filled' : 'hover:bg-gray-50'
          )}
          style={{
            backgroundColor: hasActualEntry && actualCategory ? actualCategory.color : undefined,
            color: hasActualEntry && actualCategory ? getContrastColor(actualCategory.color) : undefined,
          }}
          onClick={onClick}
        >
          <div className="p-1 h-full flex flex-col justify-between overflow-hidden">
            {hasActualEntry && actualCategory ? (
              <>
                <div className="text-xs font-medium truncate overflow-hidden">
                  {actualCategory.name}
                </div>
                {actualEntry.description && (
                  <div className="text-xs opacity-80 truncate mt-1 overflow-hidden">
                    {actualEntry.description}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-xs text-gray-400">Track</span>
              </div>
            )}

            {/* Actual Priority Indicator */}
            {actualQuadrantInfo && (
              <div
                className="absolute top-0.5 right-0.5 flex items-center justify-center w-4 h-4 rounded-full text-white text-xs font-bold shadow-sm"
                style={{ backgroundColor: actualQuadrantInfo.bgColor }}
                title={`Actual: ${actualQuadrantInfo.label}`}
              >
                <span className="text-xs leading-none">{actualQuadrantInfo.symbol}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Execution Status Indicator */}
      {executionStatus !== 'empty' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white">
          {executionStatus === 'completed' && <div className="w-full h-full bg-green-500 rounded-full" title="Plan completed as expected" />}
          {executionStatus === 'different' && <div className="w-full h-full bg-yellow-500 rounded-full" title="Different activity than planned" />}
          {executionStatus === 'missed' && <div className="w-full h-full bg-red-500 rounded-full" title="Planned activity missed" />}
          {executionStatus === 'unplanned' && <div className="w-full h-full bg-blue-500 rounded-full" title="Unplanned activity" />}
        </div>
      )}
    </div>
  );
}
