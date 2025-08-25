/**
 * Unit test for category creation flow
 * Tests the end-to-end category creation process
 */

import { Category } from '@/lib/models/Category';
import { TimeTrackingRepository } from '@/lib/repositories/TimeTrackingRepository';
import { LocalStorageService } from '@/lib/services/StorageService';
import { CategoryFormData } from '@/types';

// Mock localStorage for testing
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Category Creation Flow', () => {
  let repository: TimeTrackingRepository;
  let storageService: LocalStorageService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup storage service and repository
    storageService = new LocalStorageService();
    repository = new TimeTrackingRepository(storageService);

    // Mock localStorage to return empty data initially
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  test('Category model creation works correctly', () => {
    const formData: CategoryFormData = {
      name: 'Test Category',
      color: '#3B82F6',
    };

    const category = Category.fromFormData(formData);

    expect(category.name).toBe('Test Category');
    expect(category.color).toBe('#3B82F6');
    expect(category.id).toBeDefined();
    expect(category.createdAt).toBeInstanceOf(Date);
  });

  test('Category toJSON() returns plain object', () => {
    const formData: CategoryFormData = {
      name: 'Test Category',
      color: '#3B82F6',
    };

    const category = Category.fromFormData(formData);
    const json = category.toJSON();

    expect(json).toEqual({
      id: category.id,
      name: 'Test Category',
      color: '#3B82F6',
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });

    // Ensure it's a plain object, not a class instance
    expect(json.constructor).toBe(Object);
    expect(json instanceof Category).toBe(false);
  });

  test('Repository createCategory returns Category instance', async () => {
    await repository.initialize();

    const formData: CategoryFormData = {
      name: 'Test Category',
      color: '#3B82F6',
    };

    const category = await repository.createCategory(formData);

    expect(category).toBeInstanceOf(Category);
    expect(category.name).toBe('Test Category');
    expect(category.color).toBe('#3B82F6');
  });

  test('Repository stores category in localStorage', async () => {
    await repository.initialize();

    const formData: CategoryFormData = {
      name: 'Test Category',
      color: '#3B82F6',
    };

    await repository.createCategory(formData);

    // Verify localStorage.setItem was called
    expect(mockLocalStorage.setItem).toHaveBeenCalled();

    // Get the stored data
    const setItemCalls = mockLocalStorage.setItem.mock.calls;
    const lastCall = setItemCalls[setItemCalls.length - 1];
    const [key, value] = lastCall;

    expect(key).toBe('time_track_app_data');

    const storedData = JSON.parse(value);
    expect(storedData.categories).toHaveLength(8); // 7 default + 1 new
    expect(storedData.categories[7].name).toBe('Test Category');
  });

  test('End-to-end category creation flow', async () => {
    // 1. Initialize repository
    await repository.initialize();

    // 2. Get initial categories count
    const initialCategories = await repository.getCategories();
    const initialCount = initialCategories.length;

    // 3. Create new category
    const formData: CategoryFormData = {
      name: 'E2E Test Category',
      color: '#EF4444',
    };

    const createdCategory = await repository.createCategory(formData);

    // 4. Verify category was created correctly
    expect(createdCategory).toBeInstanceOf(Category);
    expect(createdCategory.name).toBe('E2E Test Category');

    // 5. Verify category appears in getCategories()
    const updatedCategories = await repository.getCategories();
    expect(updatedCategories).toHaveLength(initialCount + 1);

    const newCategory = updatedCategories.find(cat => cat.name === 'E2E Test Category');
    expect(newCategory).toBeDefined();
    expect(newCategory?.color).toBe('#EF4444');
  });
});

// Manual test function for browser console
export function manualCategoryTest() {
  console.log('🧪 Starting manual category creation test...');

  const formData: CategoryFormData = {
    name: 'Manual Test Category',
    color: '#10B981',
  };

  try {
    const category = Category.fromFormData(formData);
    console.log('✅ Category created:', category);

    const json = category.toJSON();
    console.log('✅ Category JSON:', json);

    return { success: true, category, json };
  } catch (error) {
    console.error('❌ Category creation failed:', error);
    return { success: false, error };
  }
}

// Make it available globally for browser testing
if (typeof window !== 'undefined') {
  (window as typeof window & { manualCategoryTest: typeof manualCategoryTest }).manualCategoryTest = manualCategoryTest;
}
