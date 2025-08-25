'use client';

import { Button } from '@/components/ui/Button';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { CATEGORY_COLORS } from '@/types';
import { useState } from 'react';

interface CategoryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: {
    id: string;
    name: string;
    color: string;
  };
}

export function CategoryForm({ onSuccess, onCancel, initialData }: CategoryFormProps) {
  const { actions } = useTimeTracking();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    color: initialData?.color || CATEGORY_COLORS[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();



    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {

      if (isEditing) {
        await actions.updateCategory(initialData.id, formData);
      } else {
        await actions.createCategory(formData);
      }


      // Reset form data
      setFormData({
        name: '',
        color: '#3B82F6',
      });

      // Call success callback
      onSuccess();
    } catch (err) {

      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </h4>
      </div>

      {/* Category Name */}
      <div>
        <label htmlFor="categoryName" className="block text-xs font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          id="categoryName"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Work/Coding"
          className="input-field text-sm"
          maxLength={50}
          required
        />
      </div>

      {/* Color Selection */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="grid grid-cols-6 gap-2">
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${formData.color === color
                ? 'border-gray-900 scale-110'
                : 'border-gray-300 hover:border-gray-400'
                }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2 pt-2">
        <Button
          type="submit"
          size="sm"
          isLoading={isSubmitting}
          className="flex-1"
        >
          {isEditing ? 'Update' : 'Add'} Category
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
