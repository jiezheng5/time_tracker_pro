'use client';

import { TimeTrackingRepository } from '@/lib/repositories/TimeTrackingRepository';
import { LocalStorageService } from '@/lib/services/StorageService';
import { formatDateString, getCurrentPacificDate, getWeekDays } from '@/lib/utils';
import { Category, CategoryFormData, ChartFilters, EisenhowerQuadrant, PlannedEntry, TimeEntry, TimeEntryFormData } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

// State interface
interface TimeTrackingState {
  categories: Category[];
  timeEntries: TimeEntry[];
  plannedEntries: PlannedEntry[];
  isLoading: boolean;
  error: string | null;
  currentWeek: Date;
  chartFilters: ChartFilters;
}

// Action types
type TimeTrackingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_TIME_ENTRIES'; payload: TimeEntry[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'UPSERT_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'DELETE_TIME_ENTRY'; payload: { date: string; hour: number } }
  | { type: 'SET_PLANNED_ENTRIES'; payload: PlannedEntry[] }
  | { type: 'UPSERT_PLANNED_ENTRY'; payload: PlannedEntry }
  | { type: 'DELETE_PLANNED_ENTRY'; payload: string }
  | { type: 'SET_CURRENT_WEEK'; payload: Date }
  | { type: 'CLEAR_WEEK_DATA'; payload: Date }
  | { type: 'CLEAR_CELL_DATA'; payload: { date: string; hour: number } }
  | { type: 'TOGGLE_CATEGORY_FILTER'; payload: string }
  | { type: 'SET_DATE_RANGE_FILTER'; payload: { startDate: Date; endDate: Date } }
  | { type: 'CLEAR_DATE_RANGE_FILTER' }
  | { type: 'TOGGLE_QUADRANT_FILTER'; payload: EisenhowerQuadrant }
  | { type: 'CLEAR_ALL_FILTERS' }
  | { type: 'SELECT_ONLY_CATEGORY'; payload: string }
  | { type: 'HIDE_ALL_CATEGORIES' };

// Context interface
interface TimeTrackingContextType {
  state: TimeTrackingState;
  actions: {
    // Category actions
    createCategory: (formData: CategoryFormData) => Promise<void>;
    updateCategory: (id: string, updates: Partial<CategoryFormData>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;

    // Time entry actions
    upsertTimeEntry: (date: string, hour: number, formData: TimeEntryFormData) => Promise<void>;
    deleteTimeEntry: (date: string, hour: number) => Promise<void>;

    // Planned entry actions
    createPlannedEntry: (date: string, hour: number, formData: PlannedEntryFormData) => Promise<void>;
    updatePlannedEntry: (id: string, formData: PlannedEntryFormData) => Promise<void>;
    deletePlannedEntry: (id: string) => Promise<void>;

    // Navigation actions
    setCurrentWeek: (date: Date) => void;

    // Chart filter actions
    toggleCategoryFilter: (categoryId: string) => void;
    setDateRangeFilter: (startDate: Date, endDate: Date) => void;
    clearDateRangeFilter: () => void;
    toggleQuadrantFilter: (quadrant: EisenhowerQuadrant) => void;
    clearAllFilters: () => void;
    selectOnlyCategory: (categoryId: string) => void;
    hideAllCategories: () => void;

    // Utility actions
    clearAllData: () => Promise<void>;
    refreshData: () => Promise<void>;
    clearWeekData: (weekDate: Date) => Promise<void>;
    clearCellData: (date: string, hour: number) => Promise<void>;
    loadDefaultCategories: () => Promise<void>;
  };
}

// Initial state
const initialState: TimeTrackingState = {
  categories: [],
  timeEntries: [],
  plannedEntries: [],
  isLoading: true,
  error: null,
  currentWeek: getCurrentPacificDate(),
  chartFilters: {
    selectedCategories: [], // Empty = show all
    selectedQuadrants: [], // Empty = show all
  },
};

// Reducer
function timeTrackingReducer(state: TimeTrackingState, action: TimeTrackingAction): TimeTrackingState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };

    case 'SET_TIME_ENTRIES':
      return { ...state, timeEntries: action.payload };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload]
      };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(cat =>
          cat.id === action.payload.id ? action.payload : cat
        ),
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(cat => cat.id !== action.payload),
      };

    case 'UPSERT_TIME_ENTRY':
      const existingIndex = state.timeEntries.findIndex(
        entry => entry.date === action.payload.date && entry.hour === action.payload.hour
      );

      if (existingIndex >= 0) {
        // Update existing
        return {
          ...state,
          timeEntries: state.timeEntries.map((entry, index) =>
            index === existingIndex ? action.payload : entry
          ),
        };
      } else {
        // Add new
        return {
          ...state,
          timeEntries: [...state.timeEntries, action.payload],
        };
      }

    case 'DELETE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.filter(
          entry => !(entry.date === action.payload.date && entry.hour === action.payload.hour)
        ),
      };

    case 'SET_PLANNED_ENTRIES':
      return { ...state, plannedEntries: action.payload };

    case 'UPSERT_PLANNED_ENTRY':
      const existingPlannedIndex = state.plannedEntries.findIndex(entry => entry.id === action.payload.id);
      if (existingPlannedIndex >= 0) {
        // Update existing
        const updatedPlannedEntries = [...state.plannedEntries];
        updatedPlannedEntries[existingPlannedIndex] = action.payload;
        return {
          ...state,
          plannedEntries: updatedPlannedEntries,
        };
      } else {
        // Add new
        return {
          ...state,
          plannedEntries: [...state.plannedEntries, action.payload],
        };
      }

    case 'DELETE_PLANNED_ENTRY':
      return {
        ...state,
        plannedEntries: state.plannedEntries.filter(entry => entry.id !== action.payload),
      };

    case 'SET_CURRENT_WEEK':
      return { ...state, currentWeek: action.payload };

    case 'TOGGLE_CATEGORY_FILTER':
      const categoryId = action.payload;
      const isSelected = state.chartFilters.selectedCategories.includes(categoryId);
      return {
        ...state,
        chartFilters: {
          ...state.chartFilters,
          selectedCategories: isSelected
            ? state.chartFilters.selectedCategories.filter(id => id !== categoryId)
            : [...state.chartFilters.selectedCategories, categoryId],
        },
      };

    case 'SET_DATE_RANGE_FILTER':
      return {
        ...state,
        chartFilters: {
          ...state.chartFilters,
          dateRange: action.payload,
        },
      };

    case 'CLEAR_DATE_RANGE_FILTER':
      return {
        ...state,
        chartFilters: {
          ...state.chartFilters,
          dateRange: undefined,
        },
      };

    case 'TOGGLE_QUADRANT_FILTER':
      const quadrant = action.payload;
      const isQuadrantSelected = state.chartFilters.selectedQuadrants.includes(quadrant);
      return {
        ...state,
        chartFilters: {
          ...state.chartFilters,
          selectedQuadrants: isQuadrantSelected
            ? state.chartFilters.selectedQuadrants.filter(q => q !== quadrant)
            : [...state.chartFilters.selectedQuadrants, quadrant],
        },
      };

    case 'CLEAR_ALL_FILTERS':
      return {
        ...state,
        chartFilters: {
          selectedCategories: [],
          selectedQuadrants: [],
        },
      };

    case 'SELECT_ONLY_CATEGORY':
      return {
        ...state,
        chartFilters: {
          ...state.chartFilters,
          selectedCategories: [action.payload],
        },
      };

    case 'HIDE_ALL_CATEGORIES':
      return {
        ...state,
        chartFilters: {
          ...state.chartFilters,
          selectedCategories: state.categories.map(cat => cat.id),
        },
      };

    case 'CLEAR_WEEK_DATA':
      const weekDate = action.payload;
      const weekDays = getWeekDays(weekDate);
      const weekDateStrings = weekDays.map(day => formatDateString(day));

      return {
        ...state,
        timeEntries: state.timeEntries.filter(entry => !weekDateStrings.includes(entry.date)),
        plannedEntries: state.plannedEntries.filter(entry => !weekDateStrings.includes(entry.date)),
      };

    case 'CLEAR_CELL_DATA':
      return {
        ...state,
        timeEntries: state.timeEntries.filter(
          entry => !(entry.date === action.payload.date && entry.hour === action.payload.hour)
        ),
        plannedEntries: state.plannedEntries.filter(
          entry => !(entry.date === action.payload.date && entry.hour === action.payload.hour)
        ),
      };

    default:
      return state;
  }
}

// Create context
const TimeTrackingContext = createContext<TimeTrackingContextType | null>(null);

// Repository instance (singleton)
const storageService = new LocalStorageService();
const repository = new TimeTrackingRepository(storageService);

// Provider component
interface TimeTrackingProviderProps {
  children: ReactNode;
}

export function TimeTrackingProvider({ children }: TimeTrackingProviderProps) {
  const [state, dispatch] = useReducer(timeTrackingReducer, initialState);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await repository.initialize();

        const [categoriesClasses, timeEntriesClasses, plannedEntriesClasses] = await Promise.all([
          repository.getCategories(),
          repository.getTimeEntries(),
          repository.getPlannedEntries(),
        ]);

        const categories = categoriesClasses.map(cat => cat.toJSON());
        const timeEntries = timeEntriesClasses.map(entry => entry.toJSON());
        const plannedEntries = plannedEntriesClasses.map(entry => entry.toJSON());

        dispatch({ type: 'SET_CATEGORIES', payload: categories });
        dispatch({ type: 'SET_TIME_ENTRIES', payload: timeEntries });
        dispatch({ type: 'SET_PLANNED_ENTRIES', payload: plannedEntries });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        console.error('Failed to initialize data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeData();
  }, []);

  // Action implementations
  const actions: TimeTrackingContextType['actions'] = {
    createCategory: async (formData: CategoryFormData) => {
      try {
        const categoryClass = await repository.createCategory(formData);
        const category = categoryClass.toJSON();
        dispatch({ type: 'ADD_CATEGORY', payload: category });
      } catch (error) {

        const message = error instanceof Error ? error.message : 'Failed to create category';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    updateCategory: async (id: string, updates: Partial<CategoryFormData>) => {
      try {
        const categoryClass = await repository.updateCategory(id, updates);
        const category = categoryClass.toJSON();
        dispatch({ type: 'UPDATE_CATEGORY', payload: category });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update category';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    deleteCategory: async (id: string) => {
      try {
        await repository.deleteCategory(id);
        dispatch({ type: 'DELETE_CATEGORY', payload: id });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete category';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    upsertTimeEntry: async (date: string, hour: number, formData: TimeEntryFormData) => {
      try {
        const timeEntryClass = await repository.upsertTimeEntry(date, hour, formData);
        const timeEntry = timeEntryClass.toJSON();
        dispatch({ type: 'UPSERT_TIME_ENTRY', payload: timeEntry });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save time entry';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    deleteTimeEntry: async (date: string, hour: number) => {
      try {
        await repository.deleteTimeEntry(date, hour);
        dispatch({ type: 'DELETE_TIME_ENTRY', payload: { date, hour } });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete time entry';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    createPlannedEntry: async (date: string, hour: number, formData: PlannedEntryFormData) => {
      try {
        const plannedEntryClass = await repository.createPlannedEntry(date, hour, formData);
        const plannedEntry = plannedEntryClass.toJSON();
        dispatch({ type: 'UPSERT_PLANNED_ENTRY', payload: plannedEntry });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create planned entry';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    updatePlannedEntry: async (id: string, formData: PlannedEntryFormData) => {
      try {
        const plannedEntryClass = await repository.updatePlannedEntry(id, formData);
        const plannedEntry = plannedEntryClass.toJSON();
        dispatch({ type: 'UPSERT_PLANNED_ENTRY', payload: plannedEntry });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update planned entry';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    deletePlannedEntry: async (id: string) => {
      try {
        await repository.deletePlannedEntry(id);
        dispatch({ type: 'DELETE_PLANNED_ENTRY', payload: id });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete planned entry';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    setCurrentWeek: (date: Date) => {
      dispatch({ type: 'SET_CURRENT_WEEK', payload: date });
    },

    clearAllData: async () => {
      try {
        await repository.clearAllData();
        dispatch({ type: 'SET_CATEGORIES', payload: [] });
        dispatch({ type: 'SET_TIME_ENTRIES', payload: [] });

        // Reload default data
        const categoriesClasses = await repository.getCategories();
        const categories = categoriesClasses.map(cat => cat.toJSON());
        dispatch({ type: 'SET_CATEGORIES', payload: categories });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to clear data';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    refreshData: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const [categoriesClasses, timeEntriesClasses] = await Promise.all([
          repository.getCategories(),
          repository.getTimeEntries(),
        ]);

        const categories = categoriesClasses.map(cat => cat.toJSON());
        const timeEntries = timeEntriesClasses.map(entry => entry.toJSON());

        dispatch({ type: 'SET_CATEGORIES', payload: categories });
        dispatch({ type: 'SET_TIME_ENTRIES', payload: timeEntries });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to refresh data';
        dispatch({ type: 'SET_ERROR', payload: message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    // Chart filter actions
    toggleCategoryFilter: (categoryId: string) => {
      dispatch({ type: 'TOGGLE_CATEGORY_FILTER', payload: categoryId });
    },

    setDateRangeFilter: (startDate: Date, endDate: Date) => {
      dispatch({ type: 'SET_DATE_RANGE_FILTER', payload: { startDate, endDate } });
    },

    clearDateRangeFilter: () => {
      dispatch({ type: 'CLEAR_DATE_RANGE_FILTER' });
    },

    toggleQuadrantFilter: (quadrant: EisenhowerQuadrant) => {
      dispatch({ type: 'TOGGLE_QUADRANT_FILTER', payload: quadrant });
    },

    clearAllFilters: () => {
      dispatch({ type: 'CLEAR_ALL_FILTERS' });
    },

    selectOnlyCategory: (categoryId: string) => {
      dispatch({ type: 'SELECT_ONLY_CATEGORY', payload: categoryId });
    },

    hideAllCategories: () => {
      dispatch({ type: 'HIDE_ALL_CATEGORIES' });
    },

    clearWeekData: async (weekDate: Date) => {
      try {
        const weekDays = getWeekDays(weekDate);
        const weekDateStrings = weekDays.map(day => formatDateString(day));

        // Clear time entries from repository
        await Promise.all(
          weekDateStrings.flatMap(date =>
            Array.from({ length: 14 }, (_, i) => i + 9).map(hour =>
              repository.deleteTimeEntry(date, hour).catch(() => { }) // Ignore errors for non-existent entries
            )
          )
        );

        // Clear planned entries from repository
        const plannedEntriesToDelete = state.plannedEntries.filter(entry =>
          weekDateStrings.includes(entry.date)
        );
        await Promise.all(
          plannedEntriesToDelete.map(entry =>
            repository.deletePlannedEntry(entry.id).catch(() => { }) // Ignore errors for non-existent entries
          )
        );

        // Update state
        dispatch({ type: 'CLEAR_WEEK_DATA', payload: weekDate });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to clear week data';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    clearCellData: async (date: string, hour: number) => {
      try {
        // Clear time entry from repository
        await repository.deleteTimeEntry(date, hour).catch(() => { }); // Ignore errors for non-existent entries

        // Clear planned entry from repository
        const plannedEntryToDelete = state.plannedEntries.find(entry =>
          entry.date === date && entry.hour === hour
        );
        if (plannedEntryToDelete) {
          await repository.deletePlannedEntry(plannedEntryToDelete.id).catch(() => { }); // Ignore errors for non-existent entries
        }

        // Update state
        dispatch({ type: 'CLEAR_CELL_DATA', payload: { date, hour } });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to clear cell data';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    loadDefaultCategories: async () => {
      try {
        // Clear all existing categories first
        await repository.clearAllCategories();

        // Load default categories
        const defaultCategories = await repository.loadDefaultCategories();
        const categories = defaultCategories.map(cat => cat.toJSON());

        // Update state
        dispatch({ type: 'SET_CATEGORIES', payload: categories });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load default categories';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },
  };

  const contextValue: TimeTrackingContextType = {
    state,
    actions,
  };

  return (
    <TimeTrackingContext.Provider value={contextValue}>
      {children}
    </TimeTrackingContext.Provider>
  );
}

// Hook to use the context
export function useTimeTracking() {
  const context = useContext(TimeTrackingContext);
  if (!context) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
}
