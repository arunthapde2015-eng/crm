import { STAT_TONES } from '@/components/StatGrid';

export const STAT_FORMATS = {
  NUMBER: 'number',
  CURRENCY: 'currency',
};

// Placeholder figures until the leads, billing and merchant APIs expose real totals.
export const DASHBOARD_STATS = [
  { id: 'total-leads', label: 'Total leads', value: 18 },
  { id: 'new-leads', label: 'New leads', value: 3 },
  {
    id: 'follow-ups-due',
    label: 'Follow-ups due today',
    value: 2,
    tone: STAT_TONES.WARNING,
  },
  {
    id: 'overdue-follow-ups',
    label: 'Overdue follow-ups',
    value: 2,
    tone: STAT_TONES.DANGER,
  },
  { id: 'qualified-leads', label: 'Qualified leads', value: 5 },
  { id: 'quotations-sent', label: 'Quotations sent', value: 2 },
  { id: 'quotations-accepted', label: 'Quotations accepted', value: 2 },
  { id: 'quotations-rejected', label: 'Quotations rejected', value: 0 },
  { id: 'proforma-invoices', label: 'Proforma invoices', value: 3 },
  { id: 'sales-invoices', label: 'Sales invoices', value: 14 },
  { id: 'total-sales', label: 'Total sales', value: 764631, format: STAT_FORMATS.CURRENCY },
  {
    id: 'total-collection',
    label: 'Total collection',
    value: 574610,
    format: STAT_FORMATS.CURRENCY,
  },
  {
    id: 'outstanding',
    label: 'Outstanding',
    value: 184121,
    format: STAT_FORMATS.CURRENCY,
    tone: STAT_TONES.WARNING,
  },
  { id: 'total-merchants', label: 'Total merchants', value: 7 },
  { id: 'active-merchants', label: 'Active merchants', value: 5 },
  { id: 'inactive-merchants', label: 'Inactive merchants', value: 0 },
  { id: 'amc-expiring', label: 'AMC expiring soon', value: 1, tone: STAT_TONES.WARNING },
  { id: 'amc-expired', label: 'AMC expired', value: 1, tone: STAT_TONES.DANGER },
];

// Ordered: each stage's conversion is measured against the one before it.
export const SALES_FUNNEL_STAGES = [
  { id: 'leads', label: 'Leads', count: 18 },
  { id: 'demo', label: 'Demo', count: 2 },
  { id: 'quotation', label: 'Quotation', count: 6 },
  { id: 'proforma', label: 'Proforma', count: 3 },
  { id: 'invoice', label: 'Invoice', count: 14 },
  { id: 'payment', label: 'Payment', count: 12 },
];

export const AFTERNOON_START_HOUR = 12;
export const EVENING_START_HOUR = 17;
