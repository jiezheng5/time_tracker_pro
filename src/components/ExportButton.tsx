'use client';

import { Button } from '@/components/ui/Button';
import { formatDateString, formatHour, getWeekDays } from '@/lib/utils';
import { useTimeTracking } from '@/stores/TimeTrackingContext';
import { Download } from 'lucide-react';
import { useState } from 'react';

export function ExportButton() {
  const { state } = useTimeTracking();
  const [isExporting, setIsExporting] = useState(false);

  const getQuadrantLabel = (isImportant: boolean, isUrgent: boolean): string => {
    if (isImportant && isUrgent) return 'Q1 (Do First)';
    if (isImportant && !isUrgent) return 'Q2 (Schedule)';
    if (!isImportant && isUrgent) return 'Q3 (Delegate)';
    return 'Q4 (Eliminate)';
  };

  const exportToCSV = async () => {
    setIsExporting(true);

    try {
      // Get current week data
      const weekDays = getWeekDays(state.currentWeek);
      const weekDateStrings = weekDays.map(formatDateString);

      // Filter entries for current week
      const weekEntries = state.timeEntries.filter(entry =>
        weekDateStrings.includes(entry.date)
      );

      // Prepare CSV data
      const csvData = weekEntries.map(entry => {
        const category = state.categories.find(cat => cat.id === entry.categoryId);
        const date = new Date(entry.date);

        return {
          Date: entry.date,
          Day: date.toLocaleDateString('en-US', { weekday: 'long' }),
          Time: formatHour(entry.hour),
          Category: category?.name || 'Unknown',
          Important: entry.isImportant ? 'Yes' : 'No',
          Urgent: entry.isUrgent ? 'Yes' : 'No',
          Quadrant: getQuadrantLabel(entry.isImportant, entry.isUrgent),
          Description: entry.description || '',
        };
      });

      // Sort by date and time
      csvData.sort((a, b) => {
        const dateCompare = a.Date.localeCompare(b.Date);
        if (dateCompare !== 0) return dateCompare;
        return a.Time.localeCompare(b.Time);
      });

      // Convert to CSV string
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row =>
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `time-tracking-${formatDateString(state.currentWeek)}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToCSV}
      variant="secondary"
      size="sm"
      isLoading={isExporting}
      className="flex items-center"
    >
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  );
}
