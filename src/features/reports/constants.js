export const REPORT_IDS = {
  SALES_BY_EXECUTIVE: 'sales-by-executive',
  PERFORMANCE: 'performance',
  PRODUCT_WISE: 'product-wise',
  CUSTOMER_WISE: 'customer-wise',
  MONTHLY: 'monthly',
  QUOTATIONS: 'quotations',
  MERCHANT_ONBOARDING: 'merchant-onboarding',
  AMC: 'amc',
  COLLECTIONS: 'collections',
  GST_SUMMARY: 'gst-summary',
};

export const DEFAULT_REPORT_ID = REPORT_IDS.SALES_BY_EXECUTIVE;

// How each value is displayed and exported; numeric types are right-aligned.
export const COLUMN_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  CURRENCY: 'currency',
  PERCENT: 'percent',
  DATE: 'date',
};

export const DATE_PRESETS = {
  THIS_MONTH: 'this-month',
  LAST_90_DAYS: 'last-90-days',
  THIS_FY: 'this-fy',
  LAST_365_DAYS: 'last-365-days',
};

export const DATE_PRESET_LABELS = {
  [DATE_PRESETS.THIS_MONTH]: 'This month',
  [DATE_PRESETS.LAST_90_DAYS]: 'Last 90 days',
  [DATE_PRESETS.THIS_FY]: 'This FY',
  [DATE_PRESETS.LAST_365_DAYS]: 'Last 365 days',
};

// The page opens on roughly the last six months.
export const DEFAULT_RANGE_DAYS = 180;
// Indian financial year starts on 1 April (month index 3).
export const FINANCIAL_YEAR_START_MONTH = 3;

// The company is registered in Maharashtra: sales inside the state carry CGST + SGST,
// sales to other states carry IGST.
export const COMPANY_STATE = 'Maharashtra';

export const AMC_EXPIRY_WARNING_DAYS = 30;

export const QUOTATION_STATUS_LABELS = {
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
};

export const MERCHANT_STATUS_LABELS = {
  active: 'Active',
  'pending-kyc': 'Pending KYC',
  inactive: 'Inactive',
};
