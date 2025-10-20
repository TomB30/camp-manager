/**
 * Recurrence utility for generating recurring events
 */

export type RecurrenceFrequency = "daily" | "weekly" | "monthly";
export type RecurrenceEndType = "never" | "on" | "after";
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, Monday = 1, etc.

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., every 2 weeks
  daysOfWeek?: DayOfWeek[]; // For weekly recurrence
  endType: RecurrenceEndType;
  endDate?: string; // ISO date string
  occurrences?: number; // Number of occurrences
}

export interface RecurrenceData extends RecurrenceRule {
  enabled: boolean;
}

/**
 * Generates dates for recurring events based on the recurrence rule
 */
export function generateRecurrenceDates(
  startDate: Date,
  rule: RecurrenceRule,
  maxOccurrences: number = 365, // Safety limit
): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  let count = 0;

  // Add the initial date
  dates.push(new Date(currentDate));
  count++;

  // Generate subsequent dates based on frequency
  while (count < maxOccurrences) {
    let nextDate: Date | null = null;

    switch (rule.frequency) {
      case "daily":
        nextDate = addDays(currentDate, rule.interval);
        break;

      case "weekly":
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          // Find the next matching day of week
          nextDate = getNextWeeklyDate(
            currentDate,
            rule.daysOfWeek,
            rule.interval,
          );
        } else {
          // If no days specified, repeat on the same day of the week
          nextDate = addDays(currentDate, 7 * rule.interval);
        }
        break;

      case "monthly":
        nextDate = addMonths(currentDate, rule.interval);
        break;
    }

    if (!nextDate) break;

    // Check end conditions
    if (rule.endType === "on" && rule.endDate) {
      const endDate = new Date(rule.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
      if (nextDate > endDate) break;
    }

    if (rule.endType === "after" && rule.occurrences) {
      if (count >= rule.occurrences) break;
    }

    dates.push(new Date(nextDate));
    currentDate = nextDate;
    count++;
  }

  return dates;
}

/**
 * Gets the next date for weekly recurrence based on selected days of week
 */
function getNextWeeklyDate(
  currentDate: Date,
  daysOfWeek: DayOfWeek[],
  interval: number,
): Date {
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
  const currentDay = currentDate.getDay();

  // Find the next day in the current week
  const nextDayInWeek = sortedDays.find((day) => day > currentDay);

  if (nextDayInWeek !== undefined) {
    // Next occurrence is in the same week
    const daysToAdd = nextDayInWeek - currentDay;
    return addDays(currentDate, daysToAdd);
  } else {
    // Move to the next interval week and use the first selected day
    const daysUntilNextWeek = 7 - currentDay + sortedDays[0];
    const weeksToSkip = interval - 1;
    return addDays(currentDate, daysUntilNextWeek + weeksToSkip * 7);
  }
}

/**
 * Helper function to add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Helper function to add months to a date
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  result.setMonth(targetMonth);

  // Handle edge case where day doesn't exist in target month (e.g., Jan 31 -> Feb 31)
  // JavaScript automatically adjusts to the next valid date
  return result;
}

/**
 * Formats a recurrence rule into a human-readable string
 */
export function formatRecurrenceRule(rule: RecurrenceRule): string {
  let description = "";

  // Frequency
  if (rule.interval === 1) {
    description =
      rule.frequency === "daily"
        ? "Daily"
        : rule.frequency === "weekly"
          ? "Weekly"
          : "Monthly";
  } else {
    description = `Every ${rule.interval} ${
      rule.frequency === "daily"
        ? "days"
        : rule.frequency === "weekly"
          ? "weeks"
          : "months"
    }`;
  }

  // Days of week for weekly recurrence
  if (
    rule.frequency === "weekly" &&
    rule.daysOfWeek &&
    rule.daysOfWeek.length > 0
  ) {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = rule.daysOfWeek.map((d) => dayNames[d]).join(", ");
    description += ` on ${days}`;
  }

  // End condition
  if (rule.endType === "on" && rule.endDate) {
    const endDate = new Date(rule.endDate);
    description += `, until ${endDate.toLocaleDateString()}`;
  } else if (rule.endType === "after" && rule.occurrences) {
    description += `, ${rule.occurrences} times`;
  }

  return description;
}

/**
 * Validates a recurrence rule
 */
export function validateRecurrenceRule(rule: RecurrenceRule): {
  valid: boolean;
  error?: string;
} {
  if (rule.interval < 1) {
    return { valid: false, error: "Interval must be at least 1" };
  }

  if (
    rule.frequency === "weekly" &&
    rule.daysOfWeek &&
    rule.daysOfWeek.length === 0
  ) {
    return {
      valid: false,
      error:
        "At least one day of the week must be selected for weekly recurrence",
    };
  }

  if (rule.endType === "on" && !rule.endDate) {
    return { valid: false, error: "End date is required" };
  }

  if (rule.endType === "after" && (!rule.occurrences || rule.occurrences < 1)) {
    return { valid: false, error: "Number of occurrences must be at least 1" };
  }

  return { valid: true };
}
