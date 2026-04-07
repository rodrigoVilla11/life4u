import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a date string (YYYY-MM-DD) as local noon to avoid timezone shift.
 * new Date("2026-04-10") = UTC midnight = shows as previous day in UTC-3.
 * new Date("2026-04-10T12:00:00") = local noon = correct day everywhere.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const d = dateStr.length > 10 ? dateStr.slice(0, 10) : dateStr;
  return new Date(`${d}T12:00:00`);
}
