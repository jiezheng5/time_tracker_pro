import { AppData } from '@/types';
import { Category } from '../models/Category';

/**
 * Storage service interface for dependency injection
 */
export interface IStorageService {
  loadData(): Promise<AppData>;
  saveData(data: AppData): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Local storage implementation of storage service
 */
export class LocalStorageService implements IStorageService {
  private readonly STORAGE_KEY = 'time_track_app_data';
  private readonly CURRENT_VERSION = '1.0.0';

  /**
   * Load application data from localStorage
   */
  async loadData(): Promise<AppData> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);

      if (!stored) {
        return this.createDefaultData();
      }

      const parsed = JSON.parse(stored);

      // Handle version migration if needed
      if (parsed.version !== this.CURRENT_VERSION) {
        return this.migrateData(parsed);
      }

      return this.deserializeData(parsed);
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      return this.createDefaultData();
    }
  }

  /**
   * Save application data to localStorage
   */
  async saveData(data: AppData): Promise<void> {
    try {
      const serialized = this.serializeData(data);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
      throw new Error('Failed to save data');
    }
  }

  /**
   * Clear all data from localStorage
   */
  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      throw new Error('Failed to clear data');
    }
  }

  /**
   * Create default application data
   */
  private createDefaultData(): AppData {
    return {
      categories: Category.createDefaults().map(cat => cat.toJSON()),
      timeEntries: [],
      settings: {
        defaultView: 'weekly',
        theme: 'light',
        weekStartsOn: 1, // Monday
      },
      version: this.CURRENT_VERSION,
    };
  }

  /**
   * Serialize data for storage (convert Date objects to strings)
   */
  private serializeData(data: AppData): Record<string, unknown> {
    return {
      ...data,
      categories: data.categories.map(cat => ({
        ...cat,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(),
      })),
      timeEntries: data.timeEntries.map(entry => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })),
    };
  }

  /**
   * Deserialize data from storage (convert string dates back to Date objects)
   */
  private deserializeData(data: Record<string, unknown>): AppData {
    return {
      ...data,
      categories: (data.categories as Array<Record<string, unknown>>).map((cat) => ({
        ...cat,
        createdAt: new Date(cat.createdAt as string),
        updatedAt: new Date(cat.updatedAt as string),
      })) as AppData['categories'],
      timeEntries: (data.timeEntries as Array<Record<string, unknown>>).map((entry) => ({
        ...entry,
        createdAt: new Date(entry.createdAt as string),
        updatedAt: new Date(entry.updatedAt as string),
      })) as AppData['timeEntries'],
    } as AppData;
  }

  /**
   * Migrate data from older versions
   */
  private migrateData(oldData: Record<string, unknown>): AppData {
    // For now, just create fresh data if version doesn't match
    // In the future, implement proper migration logic here
    console.warn(`Migrating data from version ${oldData.version} to ${this.CURRENT_VERSION}`);
    return this.createDefaultData();
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!LocalStorageService.isAvailable()) {
      return { used: 0, available: 0, percentage: 0 };
    }

    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Approximate localStorage limit (5MB in most browsers)
    const available = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = (used / available) * 100;

    return { used, available, percentage };
  }
}
