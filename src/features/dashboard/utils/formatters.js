import { formatCurrency } from '@/utils/formatCurrency';

import { AFTERNOON_START_HOUR, EVENING_START_HOUR, STAT_FORMATS } from '../constants';

const LOCALE = 'en-IN';

const numberFormatter = new Intl.NumberFormat(LOCALE);
const weekdayFormatter = new Intl.DateTimeFormat(LOCALE, { weekday: 'long' });
const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Formats a stat value; currency uses Indian digit grouping (₹7,64,631). */
export function formatStatValue(value, format = STAT_FORMATS.NUMBER) {
  return format === STAT_FORMATS.CURRENCY ? formatCurrency(value) : numberFormatter.format(value);
}

/** "Wednesday, 30 September 2026" */
export function formatLongDate(date) {
  return `${weekdayFormatter.format(date)}, ${dateFormatter.format(date)}`;
}

/** Time-of-day greeting based on the date's local hour. */
export function getGreeting(date) {
  const hour = date.getHours();
  if (hour < AFTERNOON_START_HOUR) return 'Good morning';
  if (hour < EVENING_START_HOUR) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Stage count as a whole-number percentage of the previous stage.
 *
 * @returns {number | null} null when there is no previous stage to compare with.
 */
export function getConversionPercent(count, previousCount) {
  if (!previousCount) return null;
  return Math.round((count / previousCount) * 100);
}
