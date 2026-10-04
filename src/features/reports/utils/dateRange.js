import { addDays, toIsoDate } from '@/utils/formatDate';

import { DATE_PRESETS, DEFAULT_RANGE_DAYS, FINANCIAL_YEAR_START_MONTH } from '../constants';

function getFinancialYearStart(today) {
  const year =
    today.getMonth() >= FINANCIAL_YEAR_START_MONTH ? today.getFullYear() : today.getFullYear() - 1;
  return new Date(year, FINANCIAL_YEAR_START_MONTH, 1);
}

/**
 * Inclusive ISO date range for a preset, ending today.
 *
 * @param {string} preset - One of DATE_PRESETS.
 * @param {Date} today
 * @returns {{ from: string, to: string }}
 */
export function getPresetRange(preset, today) {
  const to = toIsoDate(today);
  switch (preset) {
    case DATE_PRESETS.THIS_MONTH:
      return { from: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)), to };
    case DATE_PRESETS.LAST_90_DAYS:
      return { from: toIsoDate(addDays(today, -90)), to };
    case DATE_PRESETS.THIS_FY:
      return { from: toIsoDate(getFinancialYearStart(today)), to };
    case DATE_PRESETS.LAST_365_DAYS:
      return { from: toIsoDate(addDays(today, -365)), to };
    default:
      throw new Error(`Unknown date preset: ${preset}`);
  }
}

export function getDefaultRange(today) {
  return { from: toIsoDate(addDays(today, -DEFAULT_RANGE_DAYS)), to: toIsoDate(today) };
}

/** The preset whose range equals this one, or null for a custom range. */
export function findMatchingPreset(range, today) {
  return (
    Object.values(DATE_PRESETS).find((preset) => {
      const presetRange = getPresetRange(preset, today);
      return presetRange.from === range.from && presetRange.to === range.to;
    }) ?? null
  );
}

export function isValidRange({ from, to }) {
  return Boolean(from) && Boolean(to) && from <= to;
}

/** ISO dates compare correctly as strings; both ends are inclusive. */
export function isInRange(isoDate, { from, to }) {
  return isoDate >= from && isoDate <= to;
}

/** First day of every month the range touches, as "YYYY-MM" keys, oldest first. */
export function getMonthKeys({ from, to }) {
  const keys = [];
  let [year, month] = from.split('-').map(Number);
  const [endYear, endMonth] = to.split('-').map(Number);

  while (year < endYear || (year === endYear && month <= endMonth)) {
    keys.push(`${year}-${String(month).padStart(2, '0')}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return keys;
}
