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
  isToday?: boolean;
}

export function TimeSlot({ timeSlot, onClick, isToday = false }: TimeSlotProps) {
  const { actualEntry, actualCategory } = timeSlot;
  const hasEntry = !!actualEntry;

  // Determine priority indicators and quadrant
  const showImportant = actualEntry?.isImportant;
  const showUrgent = actualEntry?.isUrgent;

  // Get Eisenhower quadrant symbol and color
  const getQuadrantInfo = () => {
    if (showImportant && showUrgent) {
      return { symbol: '🔥', bgColor: '#ef4444', label: 'Q1: Do First' };
    } else if (showImportant && !showUrgent) {
      return { symbol: '⭐', bgColor: '#10b981', label: 'Q2: Schedule' };
    } else if (!showImportant && showUrgent) {
      return { symbol: '⚡', bgColor: '#f59e0b', label: 'Q3: Delegate' };
    } else if (!showImportant && !showUrgent && actualEntry) {
      return { symbol: '💤', bgColor: '#6b7280', label: 'Q4: Eliminate' };
    }
    return null;
  };

  const quadrantInfo = getQuadrantInfo();

  return (
    <div
      className={cn(
        'time-slot border-r border-gray-200 last:border-r-0 relative cursor-pointer transition-all duration-200',
        hasEntry ? 'filled' : '',
        isToday ? 'border-primary-200' : ''
      )}
      style={{
        backgroundColor: hasEntry && actualCategory ? actualCategory.color : undefined,
        color: hasEntry && actualCategory ? getContrastColor(actualCategory.color) : undefined,
      }}
      onClick={onClick}
    >
      {/* Content */}
      <div className="p-2 h-full min-h-[60px] flex flex-col justify-between">
        {hasEntry && actualCategory && (
          <>
            {/* Category name */}
            <div className="text-xs font-medium truncate">
              {actualCategory.name}
            </div>

            {/* Description if available */}
            {actualEntry.description && (
              <div className="text-xs opacity-80 truncate mt-1">
                {actualEntry.description}
              </div>
            )}
          </>
        )}

        {/* Eisenhower Matrix Priority Indicator */}
        {quadrantInfo && (
          <div
            className="absolute top-1 right-1 flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shadow-sm"
            style={{ backgroundColor: quadrantInfo.bgColor }}
            title={quadrantInfo.label}
          >
            <span className="text-sm leading-none">{quadrantInfo.symbol}</span>
          </div>
        )}

        {/* Hover overlay for empty slots */}
        {!hasEntry && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-gray-100 bg-opacity-50">
            <span className="text-xs text-gray-600 font-medium">+ Add</span>
          </div>
        )}
      </div>
    </div>
  );
}
