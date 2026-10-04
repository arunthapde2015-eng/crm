const MONTHS_PER_YEAR = 12;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole calendar days from one ISO date to another (negative if `toIso` is earlier). */
export function getDaysBetween(fromIso, toIso) {
  // UTC midnights, so a daylight-saving change can't make a day 23 or 25 hours long.
  const toUtc = (isoDate) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((toUtc(toIso) - toUtc(fromIso)) / MS_PER_DAY);
}

/** ISO dates compare correctly as strings; both ends are inclusive. */
export function isInRange(isoDate, { from, to }) {
  return isoDate >= from && isoDate <= to;
}

/** Every month an ISO date range touches, as "YYYY-MM" keys, oldest first. */
export function getMonthKeys({ from, to }) {
  const keys = [];
  let [year, month] = from.split('-').map(Number);
  const [endYear, endMonth] = to.split('-').map(Number);

  while (year < endYear || (year === endYear && month <= endMonth)) {
    keys.push(`${year}-${String(month).padStart(2, '0')}`);
    month += 1;
    if (month > MONTHS_PER_YEAR) {
      month = 1;
      year += 1;
    }
  }
  return keys;
}

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' });

/** "2026-09" → "Sept 2026" */
export function formatMonthKey(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return MONTH_LABEL_FORMATTER.format(new Date(year, month - 1, 1));
}
