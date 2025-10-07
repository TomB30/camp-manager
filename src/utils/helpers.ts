/**
 * Utility functions for the camp manager application
 */

import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';

/**
 * Format a date string or Date object to a readable format
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format time from a date string or Date object
 */
export function formatTime(date: string | Date, formatStr: string = 'h:mm a'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Get a relative date string (Today, Tomorrow, Yesterday, or formatted date)
 */
export function getRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) return 'Today';
  if (isTomorrow(dateObj)) return 'Tomorrow';
  if (isYesterday(dateObj)) return 'Yesterday';
  
  return format(dateObj, 'EEEE, MMM d');
}

/**
 * Generate a random color for events
 */
export function generateRandomColor(): string {
  const colors = [
    '#2196F3', // Blue
    '#4CAF50', // Green
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#F44336', // Red
    '#00BCD4', // Cyan
    '#8BC34A', // Light Green
    '#FF5722', // Deep Orange
    '#673AB7', // Deep Purple
    '#009688', // Teal
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string | Date): number {
  const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Check if two time ranges overlap
 */
export function timeRangesOverlap(
  start1: string | Date,
  end1: string | Date,
  start2: string | Date,
  end2: string | Date
): boolean {
  const s1 = typeof start1 === 'string' ? parseISO(start1) : start1;
  const e1 = typeof end1 === 'string' ? parseISO(end1) : end1;
  const s2 = typeof start2 === 'string' ? parseISO(start2) : start2;
  const e2 = typeof end2 === 'string' ? parseISO(end2) : end2;
  
  return s1 < e2 && s2 < e1;
}

/**
 * Format a phone number to a standard format
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * Get initials from a name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Calculate percentage
 */
export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Sort events by start time
 */
export function sortEventsByTime<T extends { startTime: string }>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    const timeA = new Date(a.startTime).getTime();
    const timeB = new Date(b.startTime).getTime();
    return timeA - timeB;
  });
}

/**
 * Group events by date
 */
export function groupEventsByDate<T extends { startTime: string }>(
  events: T[]
): Record<string, T[]> {
  return events.reduce((groups, event) => {
    const date = format(parseISO(event.startTime), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Download data as JSON file
 */
export function downloadJSON(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}

