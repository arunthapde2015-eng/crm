import { parseIsoDate } from './formatDate';

// The Indian financial year starts in April (month index 3).
const FINANCIAL_YEAR_START_MONTH = 3;
const DEFAULT_DIGITS = 4;

/** The year an Indian financial year starts in: Feb 2026 → 2025, Apr 2026 → 2026. */
export function getFinancialYear(isoDate) {
  const date = parseIsoDate(isoDate);
  return date.getMonth() >= FINANCIAL_YEAR_START_MONTH
    ? date.getFullYear()
    : date.getFullYear() - 1;
}

/**
 * Next "<PREFIX>-<FY start year>-<sequence>" number, counting up within the financial year of
 * `isoDate`, e.g. "REC-2026-0009". Numbering restarts at 0001 each April.
 *
 * @param {string[]} existingNumbers - Every number already issued in this series.
 * @param {string} prefix - e.g. "REC", "AMC", "EXP".
 * @param {string} isoDate - The document date, which decides the financial year.
 */
export function getNextDocumentNumber(existingNumbers, prefix, isoDate, digits = DEFAULT_DIGITS) {
  const yearPrefix = `${prefix}-${getFinancialYear(isoDate)}-`;
  const highest = existingNumbers
    .filter((number) => number.startsWith(yearPrefix))
    .reduce((max, number) => Math.max(max, Number(number.slice(yearPrefix.length))), 0);
  return `${yearPrefix}${String(highest + 1).padStart(digits, '0')}`;
}
