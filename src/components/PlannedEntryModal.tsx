'use client';

import { Button } from '@/components/ui/Button';
import { formatHour } from '@/lib/utils';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { PlannedEntryFormData } from '@/types';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PlannedEntryModalProps {
  date: string;
  hour: number;
  onClose: () => void;
}

export function PlannedEntryModal({ date, hour, onClose }: PlannedEntryModalProps) {
  const { state, actions } = useTimeTracking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PlannedEntryFormData>({
    categoryId: '',
    isImportant: false,
    isUrgent: false,
    description: '',
  });

  // Find existing planned entry for this slot
  const existingPlannedEntry = state.plannedEntries?.find(
    entry => entry.date === date && entry.hour === hour
  );

  // Load existing data if editing
  useEffect(() => {
    if (existingPlannedEntry) {
      setFormData({
        categoryId: existingPlannedEntry.categoryId,
        isImportant: existingPlannedEntry.isImportant,
        isUrgent: existingPlannedEntry.isUrgent,
        description: existingPlannedEntry.description || '',
      });
    }
  }, [existingPlannedEntry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingPlannedEntry) {
        // Update existing planned entry
        await actions.updatePlannedEntry(existingPlannedEntry.id, formData);
      } else {
        // Create new planned entry
        await actions.createPlannedEntry(date, hour, formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save planned entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingPlannedEntry) return;

    setIsSubmitting(true);
    try {
      await actions.deletePlannedEntry(existingPlannedEntry.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete planned entry:', error);
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
              {existingPlannedEntry ? 'Edit' : 'Plan'} Activity
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
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a category</option>
              {state.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What do you plan to do?"
            />
          </div>

          {/* Priority Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="important"
                checked={formData.isImportant}
                onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="important" className="ml-2 block text-sm text-gray-900">
                Important
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="urgent"
                checked={formData.isUrgent}
                onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="urgent" className="ml-2 block text-sm text-gray-900">
                Urgent
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1"
              disabled={!formData.categoryId}
            >
              {existingPlannedEntry ? 'Update' : 'Save'} Plan
            </Button>

            {existingPlannedEntry && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-3"
              >
                Delete
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
