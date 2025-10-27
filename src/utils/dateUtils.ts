import type { Event } from "@/types";

/**
 * Date utility functions to handle date comparisons without timezone issues
 */
export const dateUtils = {
  filterEventsByDate,
  filterEventsByDateAndHour,
  calculateDuration,
};

/**
 * Get events for a specific date from a list of events
 * @param events Array of events with startDate property
 * @param targetDate Date to filter by
 * @returns Events that occur on the target date
 */
function filterEventsByDate<T extends { spec: {startDate: string} }>(
  events: T[],
  targetDate: Date,
): T[] {
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();

  return events.filter((event) => {
    const eventDate = new Date(event.spec.startDate);
    return (
      eventDate.getFullYear() === targetYear &&
      eventDate.getMonth() === targetMonth &&
      eventDate.getDate() === targetDay
    );
  });
}

/**
 * Get events for a specific date and hour
 * @param events Array of events with startDate property
 * @param targetDate Date to filter by
 * @param targetHour Hour to filter by (0-23)
 * @returns Events that start on the target date and hour
 */
function filterEventsByDateAndHour<T extends Event>(
  events: T[],
  targetDate: Date,
  targetHour: number,
): T[] {
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();

  return events.filter((event) => {
    const eventDate = new Date(event.spec.startDate);
    return (
      eventDate.getFullYear() === targetYear &&
      eventDate.getMonth() === targetMonth &&
      eventDate.getDate() === targetDay &&
      eventDate.getHours() === targetHour
    );
  });
}

/**
 * Calculate the duration between two dates in days and weeks
 * @param startDate Start date
 * @param endDate End date
 * @returns Duration in days and weeks
 */
function calculateDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "1 day";
  if (diffDays === 1) return "2 days";
  if (diffDays < 7) return `${diffDays + 1} days`;

  const weeks = Math.floor((diffDays + 1) / 7);
  const remainingDays = (diffDays + 1) % 7;

  if (remainingDays === 0) {
    return weeks === 1 ? "1 week" : `${weeks} weeks`;
  } else {
    return `${weeks} week${weeks > 1 ? "s" : ""}, ${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
  }
}
