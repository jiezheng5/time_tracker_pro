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
  const { entry, category } = timeSlot;
  const hasEntry = !!entry;

  // Determine priority indicators
  const showImportant = entry?.isImportant;
  const showUrgent = entry?.isUrgent;
  const showBoth = showImportant && showUrgent;

  return (
    <div
      className={cn(
        'time-slot border-r border-gray-200 last:border-r-0 relative cursor-pointer transition-all duration-200',
        hasEntry ? 'filled' : '',
        isToday ? 'border-primary-200' : ''
      )}
      style={{
        backgroundColor: hasEntry && category ? category.color : undefined,
        color: hasEntry && category ? getContrastColor(category.color) : undefined,
      }}
      onClick={onClick}
    >
      {/* Content */}
      <div className="p-2 h-full min-h-[60px] flex flex-col justify-between">
        {hasEntry && category && (
          <>
            {/* Category name */}
            <div className="text-xs font-medium truncate">
              {category.name}
            </div>

            {/* Description if available */}
            {entry.description && (
              <div className="text-xs opacity-80 truncate mt-1">
                {entry.description}
              </div>
            )}
          </>
        )}

        {/* Priority indicators */}
        {(showImportant || showUrgent) && (
          <div className="absolute top-1 right-1 flex space-x-1">
            {showBoth ? (
              <div className="priority-indicator priority-both" title="Important & Urgent" />
            ) : (
              <>
                {showImportant && (
                  <div className="priority-indicator priority-important" title="Important" />
                )}
                {showUrgent && (
                  <div className="priority-indicator priority-urgent" title="Urgent" />
                )}
              </>
            )}
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
