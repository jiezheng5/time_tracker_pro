'use client';

import { CategoryList } from '@/components/CategoryList';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { QuickStats } from '@/components/QuickStats';
import { Button } from '@/components/ui/Button';
import { useSidebar } from '@/contexts/SidebarContext';
import { addSampleDataIfEmpty, isDataEmpty } from '@/lib/utils/sampleData';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { BarChart3, Database, Plus, Tag } from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const { state, actions } = useTimeTracking();
  const { activeTab, setActiveTab } = useSidebar();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);

  const handleLoadSampleData = async () => {
    setIsLoadingSample(true);
    try {
      await addSampleDataIfEmpty(
        state.timeEntries,
        state.categories,
        state.currentWeek,
        actions.upsertTimeEntry
      );
    } catch (error) {
      console.error('Failed to load sample data:', error);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleLoadDefaultCategories = async () => {
    if (!confirm('This will replace ALL existing categories with 8 predefined default categories. This action cannot be undone. Continue?')) {
      return;
    }

    setIsLoadingDefaults(true);
    try {
      await actions.loadDefaultCategories();
    } catch (error) {
      console.error('Failed to load default categories:', error);
    } finally {
      setIsLoadingDefaults(false);
    }
  };

  return (
    <aside className="w-full h-full bg-white overflow-y-auto custom-scrollbar">
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'categories'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <Tag className="h-4 w-4 mr-2" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'stats'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Stats
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Category Actions */}
            <div className="space-y-2">
              <Button
                onClick={() => setShowCategoryForm(true)}
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>

              <Button
                onClick={handleLoadDefaultCategories}
                variant="secondary"
                size="sm"
                isLoading={isLoadingDefaults}
                className="w-full"
              >
                <Database className="h-4 w-4 mr-2" />
                {isLoadingDefaults ? 'Loading...' : 'Load Default Categories'}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Replaces all categories with 8 predefined ones
              </p>
            </div>

            {/* Category Form */}
            {showCategoryForm && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <CategoryForm
                  onSuccess={() => setShowCategoryForm(false)}
                  onCancel={() => setShowCategoryForm(false)}
                />
              </div>
            )}

            {/* Categories List */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Categories ({state.categories.length})
              </h3>
              <CategoryList />
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Sample Data Button */}
            {isDataEmpty(state.timeEntries) && (
              <div>
                <Button
                  onClick={handleLoadSampleData}
                  variant="secondary"
                  size="sm"
                  isLoading={isLoadingSample}
                  className="w-full"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Load Sample Data
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Add sample time entries to see charts in action
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Quick Stats
              </h3>
              <QuickStats />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
