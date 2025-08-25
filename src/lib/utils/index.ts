import type { Category, TimeEntry } from '@/types';
import { ExecutionStatus } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { addWeeks, eachDayOfInterval, endOfWeek, format, startOfWeek, subWeeks } from 'date-fns';

/**
 * Utility function to combine class names
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if a string is a valid date in YYYY-MM-DD format
 */
export function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Format a date to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get the start and end of the week for a given date
 */
export function getWeekBounds(date: Date, weekStartsOn: 0 | 1 = 1) {
  const start = startOfWeek(date, { weekStartsOn });
  const end = endOfWeek(date, { weekStartsOn });
  return { start, end };
}

/**
 * Get all days in a week
 */
export function getWeekDays(date: Date, weekStartsOn: 0 | 1 = 1): Date[] {
  const { start, end } = getWeekBounds(date, weekStartsOn);
  return eachDayOfInterval({ start, end });
}

/**
 * Navigate to next week
 */
export function getNextWeek(date: Date): Date {
  return addWeeks(date, 1);
}

/**
 * Navigate to previous week
 */
export function getPreviousWeek(date: Date): Date {
  return subWeeks(date, 1);
}

/**
 * Get current week string for display
 */
export function getWeekString(date: Date, weekStartsOn: 0 | 1 = 1): string {
  const { start, end } = getWeekBounds(date, weekStartsOn);

  if (start.getMonth() === end.getMonth()) {
    return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
  } else {
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return formatDateString(date) === formatDateString(today);
}

/**
 * Check if a date is in the current week
 */
export function isCurrentWeek(date: Date, weekStartsOn: 0 | 1 = 1): boolean {
  const today = new Date();
  const { start, end } = getWeekBounds(today, weekStartsOn);
  return date >= start && date <= end;
}

/**
 * Convert 24-hour format to 12-hour format
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12:00 AM';
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
}

/**
 * Get day name from date
 */
export function getDayName(date: Date): string {
  return format(date, 'EEEE');
}

/**
 * Get short day name from date
 */
export function getShortDayName(date: Date): string {
  return format(date, 'EEE');
}

/**
 * Calculate percentage with precision
 */
export function calculatePercentage(value: number, total: number, precision: number = 1): number {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(precision));
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * Create time slots for a given week
 */
export function createWeekTimeSlots(weekDays: Date[], timeEntries: TimeEntry[], categories: Category[]) {
  const WORK_HOURS = { START: 9, END: 22 };

  return weekDays.map(date => {
    const dateString = formatDateString(date);
    const timeSlots = [];

    for (let hour = WORK_HOURS.START; hour <= WORK_HOURS.END; hour++) {
      const actualEntry = timeEntries.find(e => e.date === dateString && e.hour === hour);
      const actualCategory = actualEntry ? categories.find(c => c.id === actualEntry.categoryId) : undefined;

      // For now, we only have actual entries (no planning layer yet)
      const executionStatus = actualEntry ? ExecutionStatus.EXECUTED : ExecutionStatus.PLANNED;

      timeSlots.push({
        date: dateString,
        hour,
        actualEntry,
        actualCategory,
        executionStatus,
        // Legacy support for existing components
        entry: actualEntry,
        category: actualCategory,
      });
    }

    return {
      date: dateString,
      dayName: getDayName(date),
      timeSlots,
    };
  });
}
