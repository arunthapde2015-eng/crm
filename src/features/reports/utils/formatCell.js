import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { COLUMN_TYPES } from '../constants';

const numberFormatter = new Intl.NumberFormat('en-IN');

/** Value as shown on screen and in print. Missing values (e.g. blank total cells) are empty. */
export function formatCell(value, type) {
  if (value === undefined || value === null) return '';
  switch (type) {
    case COLUMN_TYPES.CURRENCY:
      return formatCurrency(value);
    case COLUMN_TYPES.NUMBER:
      return numberFormatter.format(value);
    case COLUMN_TYPES.PERCENT:
      return `${value}%`;
    case COLUMN_TYPES.DATE:
      return formatDayMonthYear(parseIsoDate(value));
    default:
      return String(value);
  }
}
