// Core domain types for the time tracking application

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  hour: number; // 9-22 (9am-11pm)
  categoryId: string;
  isImportant: boolean;
  isUrgent: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlannedEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  hour: number; // 9-22 (9am-11pm)
  categoryId: string;
  isImportant: boolean;
  isUrgent: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Eisenhower Matrix Quadrants
export enum EisenhowerQuadrant {
  IMPORTANT_URGENT = 'Q1',        // Do First
  IMPORTANT_NOT_URGENT = 'Q2',    // Schedule
  NOT_IMPORTANT_URGENT = 'Q3',    // Delegate
  NOT_IMPORTANT_NOT_URGENT = 'Q4' // Eliminate
}

export interface QuadrantData {
  quadrant: EisenhowerQuadrant;
  label: string;
  description: string;
  hours: number;
  percentage: number;
  color: string;
}

// Execution status for plan vs actual comparison
export enum ExecutionStatus {
  PLANNED = 'planned',           // Only planned, not executed
  EXECUTED = 'executed',         // Only executed, not planned
  COMPLETED = 'completed',       // Planned and executed (matches)
  MISSED = 'missed',            // Planned but not executed
  UNPLANNED = 'unplanned'       // Executed but not planned
}

// Application state interfaces
export interface AppData {
  categories: Category[];
  timeEntries: TimeEntry[];
  plannedEntries: PlannedEntry[];
  settings: AppSettings;
  version: string;
}

export interface AppSettings {
  defaultView: 'daily' | 'weekly';
  theme: 'light' | 'dark';
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  defaultMode: AppMode;
}

// App modes for planning vs tracking
export enum AppMode {
  PLANNING = 'planning',
  TRACKING = 'tracking',
  COMPARISON = 'comparison'
}

// UI-specific types
export interface TimeSlotData {
  date: string;
  hour: number;
  plannedEntry?: PlannedEntry;
  actualEntry?: TimeEntry;
  plannedCategory?: Category;
  actualCategory?: Category;
  executionStatus: ExecutionStatus;
}

export interface WeekData {
  startDate: Date;
  endDate: Date;
  days: DayData[];
}

export interface DayData {
  date: string;
  dayName: string;
  timeSlots: TimeSlotData[];
}

// Chart data types
export interface CategoryDistribution {
  categoryId: string;
  categoryName: string;
  color: string;
  hours: number;
  percentage: number;
}

export interface WeeklyStats {
  totalTrackedHours: number;
  totalPossibleHours: number;
  trackingPercentage: number;
  categoryDistribution: CategoryDistribution[];
  quadrantDistribution: QuadrantData[];
  mostUsedCategory?: Category;
}

// Form types
export interface TimeEntryFormData {
  categoryId: string;
  isImportant: boolean;
  isUrgent: boolean;
  description?: string;
}

export interface PlannedEntryFormData {
  categoryId: string;
  isImportant: boolean;
  isUrgent: boolean;
  description?: string;
}

export interface CategoryFormData {
  name: string;
  color: string;
}

// Export types
export interface ExportData {
  date: string;
  hour: string;
  category: string;
  important: boolean;
  urgent: boolean;
  quadrant: string;
  description?: string;
}

// Predefined color palette for categories
export const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6', // Teal
  '#F43F5E', // Rose
] as const;

// Time constants
export const WORK_HOURS = {
  START: 9,  // 9 AM
  END: 22,   // 11 PM (22:00)
  TOTAL: 14  // 14 hours per day
} as const;

export const WEEK_HOURS = WORK_HOURS.TOTAL * 7; // 84 hours per week
