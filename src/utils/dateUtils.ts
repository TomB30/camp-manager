/**
 * Date utility functions to handle date comparisons without timezone issues
 */

import type { Event } from "@/types";

/**
 * Check if two dates are on the same day (ignoring time and timezone)
 * @param date1 First date to compare
 * @param date2 Second date to compare
 * @returns true if both dates are on the same day in local time
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date string matches a target date (ignoring time and timezone)
 * @param dateStr ISO date string to check
 * @param targetDate Date to compare against
 * @returns true if the date string represents the same day as targetDate
 */
export function isDateStringSameDay(
  dateStr: string,
  targetDate: Date,
): boolean {
  const date = new Date(dateStr);
  return isSameDay(date, targetDate);
}

/**
 * Get the local date components from a Date object
 * Useful for date comparisons without timezone conversion
 */
export function getLocalDateComponents(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
}

/**
 * Compare if a date string matches specific date components
 * @param dateStr ISO date string
 * @param year Target year
 * @param month Target month (0-11)
 * @param day Target day (1-31)
 * @returns true if the date matches the components
 */
export function matchesDateComponents(
  dateStr: string,
  year: number,
  month: number,
  day: number,
): boolean {
  const date = new Date(dateStr);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
}

/**
 * Check if a date string matches a target date and hour
 * @param dateStr ISO date string to check
 * @param targetDate Date to compare against
 * @param targetHour Hour to match (0-23)
 * @returns true if the date and hour match
 */
export function matchesDateAndHour(
  dateStr: string,
  targetDate: Date,
  targetHour: number,
): boolean {
  const date = new Date(dateStr);
  return (
    date.getFullYear() === targetDate.getFullYear() &&
    date.getMonth() === targetDate.getMonth() &&
    date.getDate() === targetDate.getDate() &&
    date.getHours() === targetHour
  );
}

/**
 * Format a date to a local date string (YYYY-MM-DD) without timezone conversion
 * @param date Date to format
 * @returns Local date string in YYYY-MM-DD format
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date is today (local time)
 * @param date Date to check
 * @returns true if the date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Get events for a specific date from a list of events
 * @param events Array of events with startDate property
 * @param targetDate Date to filter by
 * @returns Events that occur on the target date
 */
export function filterEventsByDate<T extends { startDate: string }>(
  events: T[],
  targetDate: Date,
): T[] {
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();

  return events.filter((event) => {
    const eventDate = new Date(event.startDate);
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
export function filterEventsByDateAndHour<T extends Event>(
  events: T[],
  targetDate: Date,
  targetHour: number,
): T[] {
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();

  return events.filter((event) => {
    const eventDate = new Date(event.startDate);
    return (
      eventDate.getFullYear() === targetYear &&
      eventDate.getMonth() === targetMonth &&
      eventDate.getDate() === targetDay &&
      eventDate.getHours() === targetHour
    );
  });
}
