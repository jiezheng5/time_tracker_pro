'use client';

import { CategoryForm } from '@/components/forms/CategoryForm';
import { Button } from '@/components/ui/Button';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function CategoryList() {
  const { state, actions } = useTimeTracking();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);



  const handleEdit = (categoryId: string) => {
    setEditingCategory(categoryId);
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await actions.deleteCategory(categoryId);
      setDeletingCategory(null);
    } catch (error) {
      // Error is handled by the context
      console.error('Failed to delete category:', error);
    }
  };

  const handleEditSuccess = () => {
    setEditingCategory(null);
  };

  if (state.categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No categories yet</p>
        <p className="text-xs mt-1">Add your first category to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {state.categories.map((category) => (
        <div key={category.id}>
          {editingCategory === category.id ? (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <CategoryForm
                initialData={category}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingCategory(null)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="flex items-center flex-1 min-w-0">
                <div
                  className="category-color-dot flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium text-gray-900 truncate">
                  {category.name}
                </span>
              </div>

              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={() => handleEdit(category.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit category"
                >
                  <Edit2 className="h-3 w-3" />
                </button>

                <button
                  onClick={() => setDeletingCategory(category.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Category
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="danger"
                onClick={() => handleDelete(deletingCategory)}
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                variant="secondary"
                onClick={() => setDeletingCategory(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
