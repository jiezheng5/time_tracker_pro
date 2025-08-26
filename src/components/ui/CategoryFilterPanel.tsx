'use client';

import { Category } from '@/types';
import { Eye, EyeOff } from 'lucide-react';

interface CategoryFilterPanelProps {
  categories: Category[];
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  className?: string;
}

export function CategoryFilterPanel({
  categories,
  selectedCategories,
  onToggleCategory,
  onSelectAll,
  onSelectNone,
  className = ''
}: CategoryFilterPanelProps) {
  const allVisible = selectedCategories.length === 0;
  const noneVisible = categories.length > 0 && selectedCategories.length === categories.length;
  const someVisible = !allVisible && !noneVisible;

  const isVisible = (categoryId: string) => {
    return !selectedCategories.includes(categoryId);
  };

  const handleSelectAll = () => {
    onSelectAll();
  };

  const handleSelectNone = () => {
    onSelectNone();
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Category Visibility</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            disabled={allVisible}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Show All
          </button>
          <span className="text-xs text-gray-300">|</span>
          <button
            onClick={handleSelectNone}
            disabled={noneVisible}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Hide All
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-4">
          No categories available
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => {
            const visible = isVisible(category.id);
            
            return (
              <div
                key={category.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors"
              >
                <button
                  onClick={() => onToggleCategory(category.id)}
                  className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${                    visible
                      ? 'bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-gray-50 border-gray-300 text-gray-400'
                  }`}
                >
                  {visible ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                </button>

                <div
                  className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />

                <span
                  className={`text-sm flex-1 transition-colors ${                    visible ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {category.name}
                </span>

                <span className="text-xs text-gray-500">
                  {visible ? 'Visible' : 'Hidden'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Status */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">
            {allVisible && 'All categories visible'}
            {someVisible && `${categories.length - selectedCategories.length} of ${categories.length} visible`}
            {noneVisible && 'No categories visible'}
          </span>
          {(someVisible || noneVisible) && (
            <button
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}