import { addDays, toIsoDate } from '@/utils/formatDate';

import { PERIODS } from '../constants';

const MONTHS_PER_QUARTER = 3;
const DAYS_FROM_MONDAY = 6;

function startOfWeek(today) {
  // getDay(): Sunday is 0. Weeks start on Monday.
  const daysSinceMonday = (today.getDay() + DAYS_FROM_MONDAY) % 7;
  return addDays(today, -daysSinceMonday);
}

/**
 * Inclusive ISO date range for a period preset, from its start up to today.
 *
 * @param {string} period - One of PERIODS except CUSTOM.
 * @param {Date} today
 */
export function getPeriodRange(period, today) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const to = toIsoDate(today);

  switch (period) {
    case PERIODS.TODAY:
      return { from: to, to };
    case PERIODS.THIS_WEEK:
      return { from: toIsoDate(startOfWeek(today)), to };
    case PERIODS.THIS_MONTH:
      return { from: toIsoDate(new Date(year, month, 1)), to };
    case PERIODS.THIS_QUARTER: {
      const quarterStartMonth = month - (month % MONTHS_PER_QUARTER);
      return { from: toIsoDate(new Date(year, quarterStartMonth, 1)), to };
    }
    case PERIODS.THIS_YEAR:
      return { from: toIsoDate(new Date(year, 0, 1)), to };
    default:
      throw new Error(`No preset range for period: ${period}`);
  }
}

/** "YYYY-MM" for a date. */
export function toMonthKey(date) {
  return toIsoDate(date).slice(0, 7);
}
