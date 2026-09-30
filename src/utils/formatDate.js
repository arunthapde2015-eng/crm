function padTwo(value) {
  return String(value).padStart(2, '0');
}

/** "30-09-2026" */
export function formatDayMonthYear(date) {
  return `${padTwo(date.getDate())}-${padTwo(date.getMonth() + 1)}-${date.getFullYear()}`;
}

/** Local calendar date as "2026-09-30", so dates compare correctly as strings. */
export function toIsoDate(date) {
  return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`;
}

/** A new Date shifted by whole calendar days (negative goes back). */
export function addDays(date, days) {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

/** "2026-09-30" → local-midnight Date (avoids the UTC shift of `new Date(isoString)`). */
export function parseIsoDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}
