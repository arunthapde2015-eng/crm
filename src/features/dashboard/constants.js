import { STAT_TONES } from '@/components/StatGrid';

export const STAT_FORMATS = {
  NUMBER: 'number',
  CURRENCY: 'currency',
};

// Placeholder figures until the leads, billing and AMC APIs expose real totals.
// Only figures someone should act on today; historical counts live in Reports and the
// funnel below, so they are not repeated here.
export const ATTENTION_STATS = [
  {
    id: 'overdue-follow-ups',
    label: 'Overdue follow-ups',
    value: 2,
    tone: STAT_TONES.DANGER,
  },
  {
    id: 'follow-ups-due',
    label: 'Follow-ups due today',
    value: 2,
    tone: STAT_TONES.WARNING,
  },
  { id: 'new-leads', label: 'New leads', value: 3 },
  { id: 'quotations-sent', label: 'Quotations sent', value: 2 },
  { id: 'amc-expired', label: 'AMC expired', value: 1, tone: STAT_TONES.DANGER },
  { id: 'amc-expiring', label: 'AMC expiring soon', value: 1, tone: STAT_TONES.WARNING },
];

export const MONEY_STATS = [
  { id: 'total-sales', label: 'Total sales', value: 764631, format: STAT_FORMATS.CURRENCY },
  { id: 'total-collection', label: 'Collected', value: 574610, format: STAT_FORMATS.CURRENCY },
  {
    id: 'outstanding',
    label: 'Outstanding',
    value: 184121,
    format: STAT_FORMATS.CURRENCY,
    tone: STAT_TONES.WARNING,
  },
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
