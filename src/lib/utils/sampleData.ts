import { Category, TimeEntry } from '@/types';
import { formatDateString, getWeekDays } from './index';

/**
 * Generate sample time entries for the current week to demonstrate functionality
 */
export function generateSampleData(categories: Category[], currentWeek: Date): TimeEntry[] {
  const weekDays = getWeekDays(currentWeek);
  const sampleEntries: TimeEntry[] = [];

  // Define sample activities for each day
  const sampleActivities = [
    // Monday
    { day: 0, hour: 9, categoryName: 'Work/Coding', important: true, urgent: false, description: 'Sprint planning meeting' },
    { day: 0, hour: 10, categoryName: 'Work/Coding', important: true, urgent: true, description: 'Fix critical bug' },
    { day: 0, hour: 11, categoryName: 'Work/Coding', important: true, urgent: true, description: 'Code review' },
    { day: 0, hour: 14, categoryName: 'Learning/Study', important: true, urgent: false, description: 'AI LangGraph tutorial' },
    { day: 0, hour: 15, categoryName: 'Learning/Study', important: true, urgent: false, description: 'Practice coding' },
    { day: 0, hour: 19, categoryName: 'Exercise/Health', important: true, urgent: false, description: 'Gym workout' },
    { day: 0, hour: 21, categoryName: 'Rest/Entertainment', important: false, urgent: false, description: 'Watch Netflix' },

    // Tuesday
    { day: 1, hour: 9, categoryName: 'Work/Coding', important: true, urgent: false, description: 'Feature development' },
    { day: 1, hour: 10, categoryName: 'Work/Coding', important: true, urgent: false, description: 'Testing' },
    { day: 1, hour: 11, categoryName: 'Work/Coding', important: false, urgent: true, description: 'Team standup' },
    { day: 1, hour: 14, categoryName: 'Learning/Study', important: true, urgent: false, description: 'Read documentation' },
    { day: 1, hour: 18, categoryName: 'Family/Social', important: true, urgent: false, description: 'Dinner with family' },
    { day: 1, hour: 20, categoryName: 'Exercise/Health', important: true, urgent: false, description: 'Evening walk' },

    // Wednesday
    { day: 2, hour: 9, categoryName: 'Work/Coding', important: true, urgent: true, description: 'Client presentation' },
    { day: 2, hour: 10, categoryName: 'Work/Coding', important: true, urgent: false, description: 'Documentation' },
    { day: 2, hour: 11, categoryName: 'Work/Coding', important: false, urgent: true, description: 'Email responses' },
    { day: 2, hour: 15, categoryName: 'Learning/Study', important: true, urgent: false, description: 'Online course' },
    { day: 2, hour: 19, categoryName: 'Family/Social', important: true, urgent: false, description: 'Call parents' },

    // Thursday
    { day: 3, hour: 9, categoryName: 'Work/Coding', important: true, urgent: false, description: 'Architecture design' },
    { day: 3, hour: 10, categoryName: 'Work/Coding', important: true, urgent: false, description: 'Implementation' },
    { day: 3, hour: 14, categoryName: 'Learning/Study', important: true, urgent: false, description: 'Research new tech' },
    { day: 3, hour: 18, categoryName: 'Exercise/Health', important: true, urgent: false, description: 'Yoga session' },
    { day: 3, hour: 20, categoryName: 'Rest/Entertainment', important: false, urgent: false, description: 'Read book' },

    // Friday
    { day: 4, hour: 9, categoryName: 'Work/Coding', important: true, urgent: false, description: 'Code cleanup' },
    { day: 4, hour: 10, categoryName: 'Work/Coding', important: false, urgent: true, description: 'Weekly report' },
    { day: 4, hour: 11, categoryName: 'Work/Coding', important: true, urgent: false, description: 'Team retrospective' },
    { day: 4, hour: 15, categoryName: 'Learning/Study', important: true, urgent: false, description: 'Skill practice' },
    { day: 4, hour: 19, categoryName: 'Family/Social', important: true, urgent: false, description: 'Friends meetup' },

    // Weekend activities
    { day: 5, hour: 10, categoryName: 'Exercise/Health', important: true, urgent: false, description: 'Morning run' },
    { day: 5, hour: 14, categoryName: 'Family/Social', important: true, urgent: false, description: 'Family time' },
    { day: 5, hour: 16, categoryName: 'Rest/Entertainment', important: false, urgent: false, description: 'Hobby project' },
    { day: 5, hour: 20, categoryName: 'Rest/Entertainment', important: false, urgent: false, description: 'Movie night' },

    { day: 6, hour: 11, categoryName: 'Exercise/Health', important: true, urgent: false, description: 'Outdoor activity' },
    { day: 6, hour: 14, categoryName: 'Learning/Study', important: true, urgent: false, description: 'Personal project' },
    { day: 6, hour: 16, categoryName: 'Family/Social', important: true, urgent: false, description: 'Social gathering' },
    { day: 6, hour: 19, categoryName: 'Rest/Entertainment', important: false, urgent: false, description: 'Relax time' },
  ];

  // Convert sample activities to TimeEntry objects
  sampleActivities.forEach(activity => {
    const category = categories.find(cat => cat.name === activity.categoryName);
    if (category && weekDays[activity.day]) {
      const entry: TimeEntry = {
        id: `sample-${activity.day}-${activity.hour}`,
        date: formatDateString(weekDays[activity.day]),
        hour: activity.hour,
        categoryId: category.id,
        isImportant: activity.important,
        isUrgent: activity.urgent,
        description: activity.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      sampleEntries.push(entry);
    }
  });

  return sampleEntries;
}

/**
 * Check if current data is empty (no time entries)
 */
export function isDataEmpty(timeEntries: TimeEntry[]): boolean {
  return timeEntries.length === 0;
}

/**
 * Add sample data to the repository for demonstration
 */
export async function addSampleDataIfEmpty(
  timeEntries: TimeEntry[],
  categories: Category[],
  currentWeek: Date,
  upsertTimeEntry: (date: string, hour: number, formData: { categoryId: string; isImportant: boolean; isUrgent: boolean; description?: string }) => Promise<void>
): Promise<void> {
  if (isDataEmpty(timeEntries)) {
    const sampleEntries = generateSampleData(categories, currentWeek);

    // Add sample entries one by one
    for (const entry of sampleEntries) {
      try {
        await upsertTimeEntry(entry.date, entry.hour, {
          categoryId: entry.categoryId,
          isImportant: entry.isImportant,
          isUrgent: entry.isUrgent,
          description: entry.description,
        });
      } catch (error) {
        console.warn('Failed to add sample entry:', error);
      }
    }
  }
}
