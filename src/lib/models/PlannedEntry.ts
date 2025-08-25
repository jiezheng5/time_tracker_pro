import { PlannedEntry as IPlannedEntry, PlannedEntryFormData, EisenhowerQuadrant, WORK_HOURS } from '@/types';
import { generateId, isValidDate } from '../utils';

/**
 * PlannedEntry domain model with business logic
 */
export class PlannedEntry implements IPlannedEntry {
  public readonly id: string;
  public readonly date: string;
  public readonly hour: number;
  public readonly categoryId: string;
  public readonly isImportant: boolean;
  public readonly isUrgent: boolean;
  public readonly description?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(
    data: Partial<IPlannedEntry> &
      Pick<IPlannedEntry, 'date' | 'hour' | 'categoryId' | 'isImportant' | 'isUrgent'>
  ) {
    this.id = data.id || generateId();
    this.date = data.date;
    this.hour = data.hour;
    this.categoryId = data.categoryId;
    this.isImportant = data.isImportant;
    this.isUrgent = data.isUrgent;
    this.description = data.description?.trim() || undefined;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();

    this.validate();
  }

  /**
   * Create a new planned entry from form data
   */
  static fromFormData(
    date: string,
    hour: number,
    formData: PlannedEntryFormData
  ): PlannedEntry {
    return new PlannedEntry({
      date,
      hour,
      categoryId: formData.categoryId,
      isImportant: formData.isImportant,
      isUrgent: formData.isUrgent,
      description: formData.description,
    });
  }

  /**
   * Update planned entry with new data
   */
  update(updates: Partial<PlannedEntryFormData>): PlannedEntry {
    return new PlannedEntry({
      ...this,
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Get the Eisenhower quadrant for this planned entry
   */
  getQuadrant(): EisenhowerQuadrant {
    if (this.isImportant && this.isUrgent) {
      return EisenhowerQuadrant.IMPORTANT_URGENT;
    } else if (this.isImportant && !this.isUrgent) {
      return EisenhowerQuadrant.IMPORTANT_NOT_URGENT;
    } else if (!this.isImportant && this.isUrgent) {
      return EisenhowerQuadrant.NOT_IMPORTANT_URGENT;
    } else {
      return EisenhowerQuadrant.NOT_IMPORTANT_NOT_URGENT;
    }
  }

  /**
   * Get human-readable time string
   */
  getTimeString(): string {
    const hour12 = this.hour > 12 ? this.hour - 12 : this.hour;
    const ampm = this.hour >= 12 ? 'PM' : 'AM';
    return `${hour12}:00 ${ampm}`;
  }

  /**
   * Get formatted date string
   */
  getFormattedDate(): string {
    const date = new Date(this.date);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): IPlannedEntry {
    return {
      id: this.id,
      date: this.date,
      hour: this.hour,
      categoryId: this.categoryId,
      isImportant: this.isImportant,
      isUrgent: this.isUrgent,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Validate planned entry data
   */
  private validate(): void {
    if (!isValidDate(this.date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    if (!Number.isInteger(this.hour) || this.hour < WORK_HOURS.START || this.hour > WORK_HOURS.END) {
      throw new Error(`Hour must be between ${WORK_HOURS.START} and ${WORK_HOURS.END}`);
    }

    if (!this.categoryId || this.categoryId.trim().length === 0) {
      throw new Error('Category ID is required');
    }

    if (this.description && this.description.length > 200) {
      throw new Error('Description must be 200 characters or less');
    }
  }

  /**
   * Check if this planned entry equals another
   */
  equals(other: PlannedEntry): boolean {
    return this.id === other.id;
  }

  /**
   * Check if this planned entry conflicts with another (same date and hour)
   */
  conflictsWith(other: PlannedEntry): boolean {
    return this.date === other.date && this.hour === other.hour && this.id !== other.id;
  }
}
