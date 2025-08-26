import { CATEGORY_COLORS, CategoryFormData, Category as ICategory } from '@/types';
import { generateId } from '../utils';

/**
 * Category domain model with business logic
 */
export class Category implements ICategory {
  public readonly id: string;
  public readonly name: string;
  public readonly color: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: Partial<ICategory> & Pick<ICategory, 'name' | 'color'>) {
    this.id = data.id || generateId();
    this.name = data.name.trim();
    this.color = data.color;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();

    this.validate();
  }

  /**
   * Create a new category from form data
   */
  static fromFormData(formData: CategoryFormData): Category {
    return new Category({
      name: formData.name,
      color: formData.color,
    });
  }

  /**
   * Create default categories for new users
   */
  static createDefaults(): Category[] {
    const defaultCategories = [
      { name: 'Exercise', color: CATEGORY_COLORS[2] },
      { name: 'Family/Social', color: CATEGORY_COLORS[3] },
      { name: 'Fun', color: CATEGORY_COLORS[4] },
      { name: 'Reading', color: CATEGORY_COLORS[6] },
      { name: 'Study/Job', color: CATEGORY_COLORS[1] },
      { name: 'Study/NonJob', color: CATEGORY_COLORS[2] },
      { name: 'Work/Coding', color: CATEGORY_COLORS[0] },
      { name: 'Work/NonCoding', color: CATEGORY_COLORS[5] },
    ];

    return defaultCategories.map(cat => new Category(cat));
  }

  /**
   * Update category with new data
   */
  update(updates: Partial<Pick<ICategory, 'name' | 'color'>>): Category {
    return new Category({
      ...this,
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): ICategory {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Validate category data
   */
  private validate(): void {
    if (!this.name || this.name.length === 0) {
      throw new Error('Category name is required');
    }

    if (this.name.length > 50) {
      throw new Error('Category name must be 50 characters or less');
    }

    if (!this.color || !this.isValidColor(this.color)) {
      throw new Error('Valid color is required');
    }
  }

  /**
   * Check if color is valid hex color
   */
  private isValidColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  /**
   * Get contrast color for text (black or white)
   */
  getContrastColor(): string {
    // Convert hex to RGB
    const r = parseInt(this.color.slice(1, 3), 16);
    const g = parseInt(this.color.slice(3, 5), 16);
    const b = parseInt(this.color.slice(5, 7), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  /**
   * Check if this category equals another
   */
  equals(other: Category): boolean {
    return this.id === other.id;
  }
}
