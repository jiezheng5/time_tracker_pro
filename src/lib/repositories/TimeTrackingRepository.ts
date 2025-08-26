import { AppData, CategoryFormData, PlannedEntryFormData, TimeEntryFormData } from '@/types';
import { Category } from '../models/Category';
import { PlannedEntry } from '../models/PlannedEntry';
import { TimeEntry } from '../models/TimeEntry';
import { IStorageService } from '../services/StorageService';
import { formatDateString } from '../utils';

/**
 * Repository for managing time tracking data
 * Implements Repository pattern for data access abstraction
 */
export class TimeTrackingRepository {
  private data: AppData | null = null;
  private isLoaded = false;

  constructor(private storageService: IStorageService) { }

  /**
   * Initialize repository by loading data
   */
  async initialize(): Promise<void> {
    if (!this.isLoaded) {
      this.data = await this.storageService.loadData();
      this.isLoaded = true;
    }
  }

  /**
   * Save current data to storage
   */
  private async saveData(): Promise<void> {
    if (this.data) {
      await this.storageService.saveData(this.data);
    }
  }

  /**
   * Ensure data is loaded
   */
  private ensureLoaded(): void {
    if (!this.isLoaded || !this.data) {
      throw new Error('Repository not initialized. Call initialize() first.');
    }
  }

  // Category operations

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    this.ensureLoaded();
    return this.data!.categories.map(cat => new Category(cat));
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    this.ensureLoaded();
    const categoryData = this.data!.categories.find(cat => cat.id === id);
    return categoryData ? new Category(categoryData) : null;
  }

  /**
   * Create a new category
   */
  async createCategory(formData: CategoryFormData): Promise<Category> {
    this.ensureLoaded();

    // Check for duplicate names
    const existingCategory = this.data!.categories.find(
      cat => cat.name.toLowerCase() === formData.name.toLowerCase()
    );

    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    const category = Category.fromFormData(formData);
    this.data!.categories.push(category.toJSON());
    await this.saveData();

    return category;
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, updates: Partial<CategoryFormData>): Promise<Category> {
    this.ensureLoaded();

    const index = this.data!.categories.findIndex(cat => cat.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }

    // Check for duplicate names (excluding current category)
    if (updates.name) {
      const existingCategory = this.data!.categories.find(
        cat => cat.id !== id && cat.name.toLowerCase() === updates.name!.toLowerCase()
      );

      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }
    }

    const currentCategory = new Category(this.data!.categories[index]);
    const updatedCategory = currentCategory.update(updates);

    this.data!.categories[index] = updatedCategory.toJSON();
    await this.saveData();

    return updatedCategory;
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    this.ensureLoaded();

    // Check if category is in use
    const isInUse = this.data!.timeEntries.some(entry => entry.categoryId === id);
    if (isInUse) {
      throw new Error('Cannot delete category that is in use');
    }

    const index = this.data!.categories.findIndex(cat => cat.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }

    this.data!.categories.splice(index, 1);
    await this.saveData();
  }

  // Time entry operations

  /**
   * Get all time entries
   */
  async getTimeEntries(): Promise<TimeEntry[]> {
    this.ensureLoaded();
    return this.data!.timeEntries.map(entry => new TimeEntry(entry));
  }

  /**
   * Get all planned entries
   */
  async getPlannedEntries(): Promise<PlannedEntry[]> {
    this.ensureLoaded();
    return this.data!.plannedEntries.map(entry => new PlannedEntry(entry));
  }

  /**
   * Get time entries for a specific date range
   */
  async getTimeEntriesForDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    this.ensureLoaded();

    const start = formatDateString(startDate);
    const end = formatDateString(endDate);

    return this.data!.timeEntries
      .filter(entry => entry.date >= start && entry.date <= end)
      .map(entry => new TimeEntry(entry));
  }

  /**
   * Get time entry for specific date and hour
   */
  async getTimeEntry(date: string, hour: number): Promise<TimeEntry | null> {
    this.ensureLoaded();

    const entryData = this.data!.timeEntries.find(
      entry => entry.date === date && entry.hour === hour
    );

    return entryData ? new TimeEntry(entryData) : null;
  }

  /**
   * Create or update a time entry
   */
  async upsertTimeEntry(
    date: string,
    hour: number,
    formData: TimeEntryFormData
  ): Promise<TimeEntry> {
    this.ensureLoaded();

    // Verify category exists
    const categoryExists = this.data!.categories.some(cat => cat.id === formData.categoryId);
    if (!categoryExists) {
      throw new Error('Selected category does not exist');
    }

    // Check for existing entry
    const existingIndex = this.data!.timeEntries.findIndex(
      entry => entry.date === date && entry.hour === hour
    );

    const timeEntry = TimeEntry.fromFormData(date, hour, formData);

    if (existingIndex >= 0) {
      // Update existing entry
      this.data!.timeEntries[existingIndex] = timeEntry.toJSON();
    } else {
      // Create new entry
      this.data!.timeEntries.push(timeEntry.toJSON());
    }

    await this.saveData();
    return timeEntry;
  }

  /**
   * Delete a time entry
   */
  async deleteTimeEntry(date: string, hour: number): Promise<void> {
    this.ensureLoaded();

    const index = this.data!.timeEntries.findIndex(
      entry => entry.date === date && entry.hour === hour
    );

    if (index === -1) {
      throw new Error('Time entry not found');
    }

    this.data!.timeEntries.splice(index, 1);
    await this.saveData();
  }

  /**
   * Create a new planned entry
   */
  async createPlannedEntry(date: string, hour: number, formData: PlannedEntryFormData): Promise<PlannedEntry> {
    this.ensureLoaded();

    const plannedEntry = PlannedEntry.fromFormData(date, hour, formData);

    // Check for existing planned entry at this time slot
    const existingIndex = this.data!.plannedEntries.findIndex(
      entry => entry.date === date && entry.hour === hour
    );

    if (existingIndex >= 0) {
      // Replace existing planned entry
      this.data!.plannedEntries[existingIndex] = plannedEntry.toJSON();
    } else {
      // Add new planned entry
      this.data!.plannedEntries.push(plannedEntry.toJSON());
    }

    await this.saveData();
    return plannedEntry;
  }

  /**
   * Update an existing planned entry
   */
  async updatePlannedEntry(id: string, formData: PlannedEntryFormData): Promise<PlannedEntry> {
    this.ensureLoaded();

    const existingIndex = this.data!.plannedEntries.findIndex(entry => entry.id === id);
    if (existingIndex === -1) {
      throw new Error('Planned entry not found');
    }

    const existingEntry = new PlannedEntry(this.data!.plannedEntries[existingIndex]);
    const updatedEntry = existingEntry.update(formData);

    this.data!.plannedEntries[existingIndex] = updatedEntry.toJSON();
    await this.saveData();
    return updatedEntry;
  }

  /**
   * Delete a planned entry
   */
  async deletePlannedEntry(id: string): Promise<void> {
    this.ensureLoaded();

    const index = this.data!.plannedEntries.findIndex(entry => entry.id === id);
    if (index === -1) {
      throw new Error('Planned entry not found');
    }

    this.data!.plannedEntries.splice(index, 1);
    await this.saveData();
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    await this.storageService.clear();
    this.data = await this.storageService.loadData();
  }

  /**
   * Get current app data (for export)
   */
  async getAppData(): Promise<AppData> {
    this.ensureLoaded();
    return { ...this.data! };
  }
}
