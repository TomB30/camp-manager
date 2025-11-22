import type { Event } from "@/generated/api";

/**
 * Date utility functions to handle date comparisons without timezone issues
 */
export const dateUtils = {
  filterEventsByDate,
  filterEventsByDateAndHour,
  calculateDuration,
  calculateAge,
};

/**
 * Get events for a specific date from a list of events
 * @param events Array of events with startDate and endDate properties
 * @param targetDate Date to filter by
 * @returns Events that are active on the target date (including multi-day events)
 */
function filterEventsByDate<
  T extends { spec: { startDate: string; endDate: string } },
>(events: T[], targetDate: Date): T[] {
  // Set target date to midnight for comparison
  const targetDayStart = new Date(targetDate);
  targetDayStart.setHours(0, 0, 0, 0);

  const targetDayEnd = new Date(targetDate);
  targetDayEnd.setHours(23, 59, 59, 999);

  return events.filter((event) => {
    const eventStart = new Date(event.spec.startDate);
    const eventEnd = new Date(event.spec.endDate);

    // Event is active on this day if it starts on or before this day AND ends on or after this day
    return eventStart <= targetDayEnd && eventEnd >= targetDayStart;
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
    const eventStart = new Date(event.spec.startDate);
    const eventEnd = new Date(event.spec.endDate);

    // Create target datetime at the specific hour
    const targetDateTime = new Date(
      targetYear,
      targetMonth,
      targetDay,
      targetHour,
    );
    const targetEndHour = new Date(
      targetYear,
      targetMonth,
      targetDay,
      targetHour + 1,
    );

    // Check if event overlaps with this hour on this day
    // Event should be included if it's active during any part of this hour
    return eventStart < targetEndHour && eventEnd > targetDateTime;
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

/**
 * Calculate age from birthday
 * @param birthday Birthday as a string (YYYY-MM-DD format)
 * @param referenceDate Optional reference date (defaults to today)
 * @returns Age in years
 */
function calculateAge(birthday: string, referenceDate?: Date): number {
  const birthDate = new Date(birthday);
  const today = referenceDate || new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred yet this year
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
