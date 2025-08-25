'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Category } from '@/lib/models/Category';
import { TimeEntry } from '@/lib/models/TimeEntry';
import { TimeTrackingRepository } from '@/lib/repositories/TimeTrackingRepository';
import { LocalStorageService } from '@/lib/services/StorageService';
import { CategoryFormData, TimeEntryFormData } from '@/types';

// State interface
interface TimeTrackingState {
  categories: Category[];
  timeEntries: TimeEntry[];
  isLoading: boolean;
  error: string | null;
  currentWeek: Date;
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
  | { type: 'SET_CURRENT_WEEK'; payload: Date };

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
    
    // Navigation actions
    setCurrentWeek: (date: Date) => void;
    
    // Utility actions
    clearAllData: () => Promise<void>;
    refreshData: () => Promise<void>;
  };
}

// Initial state
const initialState: TimeTrackingState = {
  categories: [],
  timeEntries: [],
  isLoading: true,
  error: null,
  currentWeek: new Date(),
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
    
    case 'SET_CURRENT_WEEK':
      return { ...state, currentWeek: action.payload };
    
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
        
        const [categories, timeEntries] = await Promise.all([
          repository.getCategories(),
          repository.getTimeEntries(),
        ]);
        
        dispatch({ type: 'SET_CATEGORIES', payload: categories });
        dispatch({ type: 'SET_TIME_ENTRIES', payload: timeEntries });
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
        const category = await repository.createCategory(formData);
        dispatch({ type: 'ADD_CATEGORY', payload: category });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create category';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    updateCategory: async (id: string, updates: Partial<CategoryFormData>) => {
      try {
        const category = await repository.updateCategory(id, updates);
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
        const timeEntry = await repository.upsertTimeEntry(date, hour, formData);
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

    setCurrentWeek: (date: Date) => {
      dispatch({ type: 'SET_CURRENT_WEEK', payload: date });
    },

    clearAllData: async () => {
      try {
        await repository.clearAllData();
        dispatch({ type: 'SET_CATEGORIES', payload: [] });
        dispatch({ type: 'SET_TIME_ENTRIES', payload: [] });
        
        // Reload default data
        const categories = await repository.getCategories();
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
        
        const [categories, timeEntries] = await Promise.all([
          repository.getCategories(),
          repository.getTimeEntries(),
        ]);
        
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
