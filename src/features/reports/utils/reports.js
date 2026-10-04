import { COLUMN_TYPES } from '../constants';
import {
  amcReport,
  collectionsReport,
  merchantOnboardingReport,
  quotationsReport,
} from './operationsReports';
import {
  customerWiseReport,
  gstSummaryReport,
  monthlyReport,
  performanceReport,
  productWiseReport,
  salesByExecutiveReport,
} from './salesReports';

/**
 * Every report, in tab order. Each has an id, a tab label, a one-line description,
 * column definitions and a pure `buildRows({ data, range, today })`.
 */
export const REPORTS = [
  salesByExecutiveReport,
  performanceReport,
  productWiseReport,
  customerWiseReport,
  monthlyReport,
  quotationsReport,
  merchantOnboardingReport,
  amcReport,
  collectionsReport,
  gstSummaryReport,
];

const NUMERIC_TYPES = [COLUMN_TYPES.NUMBER, COLUMN_TYPES.CURRENCY, COLUMN_TYPES.PERCENT];

export function isNumericColumn(column) {
  return NUMERIC_TYPES.includes(column.type);
}

/**
 * Totals for columns marked `hasTotal`, labelled "Total" in the first column.
 * Returns null when there are no rows or nothing to total.
 */
export function getTotalsRow(columns, rows) {
  const totalledColumns = columns.filter((column) => column.hasTotal);
  if (rows.length === 0 || totalledColumns.length === 0) return null;

  const totals = { id: 'total', [columns[0].key]: 'Total' };
  totalledColumns.forEach((column) => {
    totals[column.key] = rows.reduce((sum, row) => sum + row[column.key], 0);
  });
  return totals;
}
