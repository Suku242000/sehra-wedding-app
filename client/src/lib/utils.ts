import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines classNames with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats date to display in a readable format
 */
export function formatDate(dateString: string | undefined, options: Intl.DateTimeFormatOptions = {}): string {
  if (!dateString) return 'Not set';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Date(dateString).toLocaleDateString('en-US', defaultOptions);
}

/**
 * Calculate days left from today to a target date
 */
export function calculateDaysLeft(targetDateString: string): number {
  const today = new Date();
  const targetDate = new Date(targetDateString);
  
  // Reset time parts to compare just the dates
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const differenceInTime = targetDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(differenceInTime / (1000 * 3600 * 24)));
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generates a color based on a string (for avatar backgrounds, etc.)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).slice(-2);
  }
  
  return color;
}

/**
 * Check if a date is in the past
 */
export function isDatePast(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  return date < today;
}

/**
 * Get a friendly date status (Today, Tomorrow, Yesterday, etc.)
 */
export function getFriendlyDateStatus(dateString: string): string {
  const today = new Date();
  const date = new Date(dateString);
  
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
