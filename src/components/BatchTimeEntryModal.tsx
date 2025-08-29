'use client';

import { Button } from '@/components/ui/Button';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { TimeEntryFormData } from '@/types';
import { X } from 'lucide-react';
import { useState } from 'react';
import { CategorySelector } from './CategorySelector';

interface BatchTimeEntryModalProps {
  selectedSlots: { date: string; hour: number }[];
  onClose: () => void;
}

export function BatchTimeEntryModal({ selectedSlots, onClose }: BatchTimeEntryModalProps) {
  const { state, actions } = useTimeTracking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TimeEntryFormData>({
    categoryId: state.categories[0]?.id || '',
    isImportant: false,
    isUrgent: false,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) return;

    setIsSubmitting(true);
    try {
      await actions.batchUpsertTimeEntries(selectedSlots, formData);
      onClose();
    } catch (error) {
      console.error('Failed to batch create time entries:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Batch Track for {selectedSlots.length} Slots
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
          </div>

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
              placeholder="What did you do?"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1"
              disabled={!formData.categoryId}
            >
              Apply to All
            </Button>
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
