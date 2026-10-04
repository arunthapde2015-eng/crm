export const INCENTIVE_TAB_IDS = {
  SUMMARY: 'summary',
  ORDERS: 'orders',
  RATES: 'rates',
  PAYOUTS: 'payouts',
};

export const INCENTIVE_TABS = [
  { id: INCENTIVE_TAB_IDS.SUMMARY, label: 'Salesperson summary' },
  { id: INCENTIVE_TAB_IDS.ORDERS, label: 'Order-wise incentives' },
  { id: INCENTIVE_TAB_IDS.RATES, label: 'Incentive rates' },
  { id: INCENTIVE_TAB_IDS.PAYOUTS, label: 'Payout history' },
];

// How a salesperson's incentive is worked out. Every type ends up as an amount per order, so
// orders can be paid individually.
export const RULE_TYPES = {
  FIXED_PER_ORDER: 'fixed-per-order',
  PERCENT_OF_ORDER: 'percent-of-order',
  ORDER_SLABS: 'order-slabs',
  MONTHLY_SLABS: 'monthly-slabs',
};

export const RULE_TYPE_LABELS = {
  [RULE_TYPES.FIXED_PER_ORDER]: 'Fixed amount per order',
  [RULE_TYPES.PERCENT_OF_ORDER]: 'Percentage of order value',
  [RULE_TYPES.ORDER_SLABS]: 'Slabs on order value',
  [RULE_TYPES.MONTHLY_SLABS]: 'Slabs on monthly sales',
};

export const ORDER_STATUSES = {
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.CONFIRMED]: 'Confirmed',
  [ORDER_STATUSES.PROCESSING]: 'Processing',
  [ORDER_STATUSES.COMPLETED]: 'Completed',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled',
};

export const PAYOUT_FILTERS = {
  ALL: 'all',
  PAID: 'paid',
  UNPAID: 'unpaid',
};

export const PAYOUT_FILTER_LABELS = {
  [PAYOUT_FILTERS.ALL]: 'Paid and unpaid',
  [PAYOUT_FILTERS.PAID]: 'Paid only',
  [PAYOUT_FILTERS.UNPAID]: 'Unpaid only',
};

export const ALL_FILTER_VALUE = 'all';

export const DEFAULT_FILTERS = {
  query: '',
  salespersonId: ALL_FILTER_VALUE,
  from: '',
  to: '',
  orderStatus: ALL_FILTER_VALUE,
  payout: PAYOUT_FILTERS.ALL,
};

export const PAYOUT_MODES = ['Bank transfer', 'UPI', 'Cash', 'Cheque', 'Salary'];
export const PAYOUT_NUMBER_PREFIX = 'PO';
export const ID_DIGITS = 4;
export const PERCENT = 100;
