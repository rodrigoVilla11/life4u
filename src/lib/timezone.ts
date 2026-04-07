/**
 * Get the current date/time in a specific timezone.
 */
export function nowInTimezone(timezone: string): Date {
  const str = new Date().toLocaleString("en-US", { timeZone: timezone });
  return new Date(str);
}

/**
 * Get start of day in a timezone, returned as UTC Date for DB queries.
 */
export function startOfDayInTz(date: Date, timezone: string): Date {
  const dateStr = date.toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD
  const start = new Date(`${dateStr}T00:00:00`);
  // Convert back: the dateStr is the date as seen in that timezone
  // We need the UTC equivalent of midnight in that timezone
  const tzOffset = getTimezoneOffsetMs(timezone, start);
  return new Date(start.getTime() + tzOffset);
}

/**
 * Get end of day in a timezone, returned as UTC Date for DB queries.
 */
export function endOfDayInTz(date: Date, timezone: string): Date {
  const dateStr = date.toLocaleDateString("en-CA", { timeZone: timezone });
  const end = new Date(`${dateStr}T23:59:59.999`);
  const tzOffset = getTimezoneOffsetMs(timezone, end);
  return new Date(end.getTime() + tzOffset);
}

/**
 * Get start of week (Monday) in a timezone.
 */
export function startOfWeekInTz(date: Date, timezone: string, weekStartsOn: number = 1): Date {
  const now = nowInTimezone(timezone);
  const day = now.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return startOfDayInTz(monday, timezone);
}

/**
 * Get end of week (Sunday) in a timezone.
 */
export function endOfWeekInTz(date: Date, timezone: string, weekStartsOn: number = 1): Date {
  const start = startOfWeekInTz(date, timezone, weekStartsOn);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return endOfDayInTz(end, timezone);
}

/**
 * Get start of month in a timezone.
 */
export function startOfMonthInTz(date: Date, timezone: string): Date {
  const dateStr = date.toLocaleDateString("en-CA", { timeZone: timezone });
  const [year, month] = dateStr.split("-");
  const first = new Date(`${year}-${month}-01T00:00:00`);
  const tzOffset = getTimezoneOffsetMs(timezone, first);
  return new Date(first.getTime() + tzOffset);
}

/**
 * Get end of month in a timezone.
 */
export function endOfMonthInTz(date: Date, timezone: string): Date {
  const dateStr = date.toLocaleDateString("en-CA", { timeZone: timezone });
  const [year, month] = dateStr.split("-");
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const end = new Date(`${year}-${month}-${String(lastDay).padStart(2, "0")}T23:59:59.999`);
  const tzOffset = getTimezoneOffsetMs(timezone, end);
  return new Date(end.getTime() + tzOffset);
}

/**
 * Format a date in a specific timezone.
 */
export function formatInTz(date: Date | string, timezone: string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("es-AR", { timeZone: timezone, ...options });
}

/**
 * Today's date string (YYYY-MM-DD) in a timezone.
 */
export function todayStringInTz(timezone: string): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: timezone });
}

/**
 * Get timezone offset in ms (difference between local and UTC).
 */
function getTimezoneOffsetMs(timezone: string, date: Date): number {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = date.toLocaleString("en-US", { timeZone: timezone });
  return new Date(utcStr).getTime() - new Date(tzStr).getTime();
}

/**
 * Common timezones for the selector.
 */
export const TIMEZONES = [
  { value: "America/Argentina/Buenos_Aires", label: "Argentina (Buenos Aires)" },
  { value: "America/Sao_Paulo", label: "Brasil (São Paulo)" },
  { value: "America/Santiago", label: "Chile (Santiago)" },
  { value: "America/Bogota", label: "Colombia (Bogotá)" },
  { value: "America/Mexico_City", label: "México (Ciudad de México)" },
  { value: "America/Lima", label: "Perú (Lima)" },
  { value: "America/Montevideo", label: "Uruguay (Montevideo)" },
  { value: "America/Caracas", label: "Venezuela (Caracas)" },
  { value: "America/New_York", label: "Estados Unidos (Nueva York)" },
  { value: "America/Chicago", label: "Estados Unidos (Chicago)" },
  { value: "America/Denver", label: "Estados Unidos (Denver)" },
  { value: "America/Los_Angeles", label: "Estados Unidos (Los Ángeles)" },
  { value: "Europe/Madrid", label: "España (Madrid)" },
  { value: "Europe/London", label: "Reino Unido (Londres)" },
  { value: "Europe/Paris", label: "Francia (París)" },
  { value: "Europe/Berlin", label: "Alemania (Berlín)" },
  { value: "Europe/Rome", label: "Italia (Roma)" },
  { value: "Europe/Lisbon", label: "Portugal (Lisboa)" },
  { value: "Asia/Tokyo", label: "Japón (Tokio)" },
  { value: "Asia/Shanghai", label: "China (Shanghái)" },
  { value: "Australia/Sydney", label: "Australia (Sídney)" },
  { value: "Pacific/Auckland", label: "Nueva Zelanda (Auckland)" },
  { value: "UTC", label: "UTC" },
];
