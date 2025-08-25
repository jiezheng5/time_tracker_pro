'use client';

import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Category } from '@/lib/models/Category';
import { CategoryForm } from '@/components/forms/CategoryForm';

interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
  categories: Category[];
}

export function CategorySelector({ value, onChange, categories }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const selectedCategory = categories.find(cat => cat.id === value);

  const handleCategorySelect = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  const handleAddCategory = () => {
    setShowAddForm(true);
    setIsOpen(false);
  };

  const handleCategoryAdded = () => {
    setShowAddForm(false);
    // The new category will be automatically available in the list
  };

  return (
    <div className="relative">
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
      >
        <div className="flex items-center">
          {selectedCategory ? (
            <>
              <div
                className="category-color-dot"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span className="text-sm text-gray-900">{selectedCategory.name}</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">Select a category</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Categories List */}
          <div className="py-1">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                  value === category.id ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                }`}
              >
                <div
                  className="category-color-dot"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Add Category Button */}
          <div className="border-t border-gray-200 py-1">
            <button
              type="button"
              onClick={handleAddCategory}
              className="w-full flex items-center px-3 py-2 text-left text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Add New Category</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Add Category Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <CategoryForm
              onSuccess={handleCategoryAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
