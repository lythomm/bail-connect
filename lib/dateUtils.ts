const TIMEZONE = "Europe/Paris";
const LOCALE = "fr-FR";

/**
 * Format a timestamp as a localized date string in Europe/Paris timezone.
 * @example formatDateParis(ts) => "lundi 2 juin 2026"
 */
export function formatDateParis(
  ts: number,
  opts?: Intl.DateTimeFormatOptions
): string {
  return new Date(ts).toLocaleDateString(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...opts,
    timeZone: TIMEZONE,
  });
}

/**
 * Format a timestamp as HH:MM in Europe/Paris timezone.
 * @example formatTimeParis(ts) => "10:00"
 */
export function formatTimeParis(ts: number): string {
  return new Date(ts).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  });
}

/**
 * Format a start/end timestamp pair as a time range in Europe/Paris timezone.
 * @example formatTimeRangeParis(start, end) => "10:00 - 10:30"
 */
export function formatTimeRangeParis(startTs: number, endTs: number): string {
  return `${formatTimeParis(startTs)} - ${formatTimeParis(endTs)}`;
}

const dateStrFormatter = new Intl.DateTimeFormat(LOCALE, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIMEZONE,
});

/**
 * Convert a timestamp to a "YYYY-MM-DD" string in Europe/Paris timezone.
 * Replaces `new Date(ts).toISOString().split("T")[0]` which uses UTC.
 */
export function toParisDateStr(ts: number): string {
  const d = new Date(ts);
  const parts = dateStrFormatter.formatToParts(d);

  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${year}-${month}-${day}`;
}

/**
 * Get the current hour (0-23) in Europe/Paris timezone.
 * Handles CET (UTC+1) and CEST (UTC+2) automatically via Intl.
 */
export function getParisHour(): number {
  const formatter = new Intl.DateTimeFormat(LOCALE, {
    hour: "numeric",
    hour12: false,
    timeZone: TIMEZONE,
  });
  return parseInt(formatter.format(new Date()), 10);
}
