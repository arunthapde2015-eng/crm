export const SALES_TAB_IDS = {
  OVERVIEW: 'overview',
  ORDERS: 'orders',
  COLLECTIONS: 'collections',
  TEAM: 'team',
  TARGETS: 'targets',
};

export const SALES_TABS = [
  { id: SALES_TAB_IDS.OVERVIEW, label: 'Overview' },
  { id: SALES_TAB_IDS.ORDERS, label: 'Orders' },
  { id: SALES_TAB_IDS.COLLECTIONS, label: 'Collections' },
  { id: SALES_TAB_IDS.TEAM, label: 'Sales team' },
  { id: SALES_TAB_IDS.TARGETS, label: 'Targets' },
];

export const ORDER_STATUSES = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.DRAFT]: 'Draft',
  [ORDER_STATUSES.CONFIRMED]: 'Confirmed',
  [ORDER_STATUSES.PROCESSING]: 'Processing',
  [ORDER_STATUSES.COMPLETED]: 'Completed',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled',
};

// Orders in these states are not (or no longer) a sale: they don't count toward sales or
// targets, and can't take payments.
export const NON_SALE_ORDER_STATUSES = [ORDER_STATUSES.DRAFT, ORDER_STATUSES.CANCELLED];

export const PAYMENT_STATUSES = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUSES.UNPAID]: 'Unpaid',
  [PAYMENT_STATUSES.PARTIAL]: 'Partially paid',
  [PAYMENT_STATUSES.PAID]: 'Paid',
};

export const PAYMENT_MODES = ['Cash', 'UPI', 'Bank transfer', 'Card', 'Cheque', 'Other'];

export const LEAD_STAGES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  FOLLOW_UP: 'follow-up',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  WON: 'won',
  LOST: 'lost',
  ON_HOLD: 'on-hold',
};

export const PERIODS = {
  TODAY: 'today',
  THIS_WEEK: 'this-week',
  THIS_MONTH: 'this-month',
  THIS_QUARTER: 'this-quarter',
  THIS_YEAR: 'this-year',
  CUSTOM: 'custom',
};

export const PERIOD_LABELS = {
  [PERIODS.TODAY]: 'Today',
  [PERIODS.THIS_WEEK]: 'This week',
  [PERIODS.THIS_MONTH]: 'This month',
  [PERIODS.THIS_QUARTER]: 'This quarter',
  [PERIODS.THIS_YEAR]: 'This year',
  [PERIODS.CUSTOM]: 'Custom',
};

export const DEFAULT_PERIOD = PERIODS.THIS_QUARTER;

// Outstanding amounts grouped by how many days have passed since the order date.
export const AGEING_BUCKETS = [
  { id: '0-30', label: '0–30 days', maxDays: 30 },
  { id: '31-60', label: '31–60 days', maxDays: 60 },
  { id: '61-90', label: '61–90 days', maxDays: 90 },
  { id: '90+', label: 'Over 90 days', maxDays: Infinity },
];

export const SALESPERSON_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const ORDER_NUMBER_PREFIX = 'ORD';
export const EMPLOYEE_ID_PREFIX = 'EMP';
export const ID_DIGITS = 4;
export const PERCENT = 100;
