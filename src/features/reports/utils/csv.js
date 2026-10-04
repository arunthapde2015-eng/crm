import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { COLUMN_TYPES } from '../constants';

const NEEDS_QUOTING = /[",\r\n]/;

function escapeCsvValue(value) {
  const text = String(value);
  return NEEDS_QUOTING.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// Numbers stay raw (no ₹ or digit grouping) so Excel treats them as numbers it can sum.
function toCsvValue(value, type) {
  if (value === undefined || value === null) return '';
  if (type === COLUMN_TYPES.DATE) return formatDayMonthYear(parseIsoDate(value));
  return value;
}

/**
 * CSV text for a report: header row, data rows, then the totals row if there is one.
 *
 * @param {{ key: string, label: string, type: string }[]} columns
 * @param {object[]} rows
 * @param {object | null} [totalsRow]
 */
export function toCsv(columns, rows, totalsRow = null) {
  const allRows = totalsRow ? [...rows, totalsRow] : rows;
  const lines = [
    columns.map((column) => escapeCsvValue(column.label)),
    ...allRows.map((row) =>
      columns.map((column) => escapeCsvValue(toCsvValue(row[column.key], column.type))),
    ),
  ];
  return lines.map((cells) => cells.join(',')).join('\r\n');
}
