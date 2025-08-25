'use client';

import { CategorySelector } from '@/components/CategorySelector';
import { Button } from '@/components/ui/Button';
import { formatHour } from '@/lib/utils';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TimeEntryModalProps {
  date: string;
  hour: number;
  onClose: () => void;
}

export function TimeEntryModal({ date, hour, onClose }: TimeEntryModalProps) {
  const { state, actions } = useTimeTracking();
  const [formData, setFormData] = useState({
    categoryId: '',
    isImportant: false,
    isUrgent: false,
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find existing entry
  const existingEntry = state.timeEntries.find(
    entry => entry.date === date && entry.hour === hour
  );

  // Initialize form with existing data
  useEffect(() => {
    if (existingEntry) {
      setFormData({
        categoryId: existingEntry.categoryId,
        isImportant: existingEntry.isImportant,
        isUrgent: existingEntry.isUrgent,
        description: existingEntry.description || '',
      });
    } else if (state.categories.length > 0) {
      // Default to first category for new entries
      setFormData(prev => ({
        ...prev,
        categoryId: state.categories[0].id,
      }));
    }
  }, [existingEntry, state.categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await actions.upsertTimeEntry(date, hour, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save time entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingEntry) return;

    setIsSubmitting(true);
    try {
      await actions.deleteTimeEntry(date, hour);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete time entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {existingEntry ? 'Edit' : 'Add'} Time Entry
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(date)} at {formatHour(hour)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <CategorySelector
              value={formData.categoryId}
              onChange={(categoryId) => setFormData({ ...formData, categoryId })}
              categories={state.categories}
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Eisenhower Matrix
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  className="checkbox-field"
                />
                <span className="ml-2 text-sm text-gray-700">Important</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                  className="checkbox-field"
                />
                <span className="ml-2 text-sm text-gray-700">Urgent</span>
              </label>
            </div>

            {/* Quadrant indicator */}
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <span className="mr-1">
                {formData.isImportant && formData.isUrgent ? '🔥' :
                  formData.isImportant && !formData.isUrgent ? '⭐' :
                    !formData.isImportant && formData.isUrgent ? '⚡' : '💤'}
              </span>
              Quadrant: {
                formData.isImportant && formData.isUrgent ? 'Q1 (Do First)' :
                  formData.isImportant && !formData.isUrgent ? 'Q2 (Schedule)' :
                    !formData.isImportant && formData.isUrgent ? 'Q3 (Delegate)' :
                      'Q4 (Eliminate)'
              }
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the activity..."
              className="input-field resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/200 characters
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1"
            >
              {existingEntry ? 'Update' : 'Save'} Entry
            </Button>

            {existingEntry && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-3"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
