import { NAV_IDS } from '@/constants/navigation';

export const QUEUE_CATEGORIES = {
  CALL_BACK: 'call-back',
  LEAD: 'lead',
  AMC: 'amc',
  PAYMENT: 'payment',
};

// Sections of the call queue, in the order they're worked through.
export const QUEUE_SECTIONS = [
  { id: QUEUE_CATEGORIES.CALL_BACK, title: 'Call-backs due' },
  { id: QUEUE_CATEGORIES.LEAD, title: 'Lead follow-ups' },
  { id: QUEUE_CATEGORIES.AMC, title: 'AMC renewal calls' },
  { id: QUEUE_CATEGORIES.PAYMENT, title: 'Payment reminders' },
];

export const CONTACT_KINDS = {
  MERCHANT: 'Merchant',
  LEAD: 'Lead',
  CUSTOMER: 'Customer',
  OTHER: 'Caller',
};

export const CALL_OUTCOMES = {
  CONNECTED: 'connected',
  CALL_BACK: 'call-back',
  NOT_REACHABLE: 'not-reachable',
  BUSY: 'busy',
  WRONG_NUMBER: 'wrong-number',
};

export const CALL_OUTCOME_LABELS = {
  [CALL_OUTCOMES.CONNECTED]: 'Connected',
  [CALL_OUTCOMES.CALL_BACK]: 'Asked to call back',
  [CALL_OUTCOMES.NOT_REACHABLE]: 'Not reachable',
  [CALL_OUTCOMES.BUSY]: 'Busy',
  [CALL_OUTCOMES.WRONG_NUMBER]: 'Wrong number',
};

// Outcomes that put the contact back in Call-backs due on a chosen date.
export const RETRY_OUTCOMES = [
  CALL_OUTCOMES.CALL_BACK,
  CALL_OUTCOMES.NOT_REACHABLE,
  CALL_OUTCOMES.BUSY,
];

export const CALL_DIRECTIONS = { OUTGOING: 'Outgoing', INCOMING: 'Incoming' };

export const TAB_IDS = { QUEUE: 'queue', LOG: 'log' };
export const MAX_NOTES_LENGTH = 500;

// Where "Open" goes for each kind of contact.
export const OPEN_NAV_IDS = {
  [CONTACT_KINDS.MERCHANT]: NAV_IDS.AMC_RENEWALS,
  [CONTACT_KINDS.LEAD]: NAV_IDS.FOLLOW_UPS,
  [CONTACT_KINDS.CUSTOMER]: NAV_IDS.SALES_INVOICES,
  [CONTACT_KINDS.OTHER]: NAV_IDS.LEADS,
};

const { MERCHANT, LEAD, CUSTOMER } = CONTACT_KINDS;
const { CALL_BACK, AMC, PAYMENT } = QUEUE_CATEGORIES;
const { CONNECTED, NOT_REACHABLE } = CALL_OUTCOMES;

// Placeholder queue until each module feeds the call desk. `details` holds what the "Why" column
// is built from, so day counts stay current.
// Formatting is skipped so each call stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_QUEUE = [
  item('cb-sahyadri', CALL_BACK, 'Sahyadri Clinic, Kothrud', MERCHANT, '9823010002', '2026-09-28', { isRequested: true, lastOutcome: NOT_REACHABLE, lastCallDate: '2026-09-27' }),
  item('cb-baner', CALL_BACK, 'Vidya Vikas School, Baner', MERCHANT, '9823010001', '2026-09-29', { isRequested: true, lastOutcome: CONNECTED, lastCallDate: '2026-09-26' }),
  item('lead-metro', QUEUE_CATEGORIES.LEAD, 'Metro Fitness Studio', LEAD, '9823010012', '2026-09-23', { product: 'Smart POS terminal', value: 25000, channel: 'Call' }),
  item('lead-saikrupa', QUEUE_CATEGORIES.LEAD, 'Sai Krupa Diagnostics', LEAD, '9823010009', '2026-09-25', { product: 'Payment gateway integration', value: 55000, channel: 'Email' }),
  item('lead-nashik', QUEUE_CATEGORIES.LEAD, 'Nashik Grape Exports', LEAD, '9823010011', '2026-09-27', { product: 'Export invoicing module', value: 24000, channel: 'Call' }),
  item('lead-greenvalley', QUEUE_CATEGORIES.LEAD, 'Green Valley Organics', LEAD, '9823010008', '2026-09-28', { product: 'E-commerce payment gateway', value: 29000, channel: 'WhatsApp' }),
  item('lead-punepharma', QUEUE_CATEGORIES.LEAD, 'Pune Pharma Distributors', LEAD, '9823010006', '2026-09-30', { product: 'Billing and inventory software', value: 38000, channel: 'Call' }),
  item('lead-jewellers', QUEUE_CATEGORIES.LEAD, 'Sai Krupa Jewellers', LEAD, '9823010010', '2026-10-01', { product: 'Smart POS terminal', value: 35000, channel: 'Visit' }),
  item('lead-deccan', QUEUE_CATEGORIES.LEAD, 'Deccan Motors', LEAD, '9823010015', '2026-10-02', { product: 'Dealer management CRM', value: 45000, channel: 'Demo' }),
  item('lead-brightfuture', QUEUE_CATEGORIES.LEAD, 'Bright Future Academy', LEAD, '9823010013', '2026-10-03', { product: 'School fee collection software', value: 18000, channel: 'Call' }),
  item('lead-shivneri', QUEUE_CATEGORIES.LEAD, 'Shivneri Hotels', LEAD, '9823010007', '2026-10-05', { product: 'Hotel POS and billing', value: 52000, channel: 'Call' }),
  item('amc-sahyadri', AMC, 'Sahyadri Clinic, Kothrud', MERCHANT, '9823010002', '2026-08-22', { note: '' }),
  item('amc-baner', AMC, 'Vidya Vikas School, Baner', MERCHANT, '9823010001', '2026-10-11', { note: 'renewal invoice unpaid' }),
  item('pay-konkan', PAYMENT, 'Konkan Fresh Mart', CUSTOMER, '9823010004', '2026-07-29', { invoiceNumber: 'INV-2026-0004', amount: 24376 }),
  item('pay-shreeji', PAYMENT, 'Shreeji Textiles', CUSTOMER, '9823010005', '2026-08-28', { invoiceNumber: 'INV-2026-0005', amount: 38145 }),
  item('pay-vidya', PAYMENT, 'Vidya Vikas School Trust', CUSTOMER, '9823010001', '2026-09-22', { invoiceNumber: 'INV-2026-0006', amount: 63720 }),
];

// prettier-ignore
export const INITIAL_CALL_LOG = [
  call('log-3', '2026-09-27T11:05', 'Sahyadri Clinic, Kothrud', '9823010002', CALL_DIRECTIONS.OUTGOING, NOT_REACHABLE, 'AMC renewal reminder', 'Sneha Patil'),
  call('log-2', '2026-09-26T16:20', 'Vidya Vikas School, Baner', '9823010001', CALL_DIRECTIONS.OUTGOING, CALL_OUTCOMES.CALL_BACK, 'Principal asked to call after the board meeting', 'Rohan Kulkarni'),
  call('log-1', '2026-09-25T12:40', 'Konkan Fresh Mart', '9823010004', CALL_DIRECTIONS.OUTGOING, CONNECTED, 'Promised payment by month end', 'Meera Iyer'),
];

function item(id, category, name, kind, phone, due, details) {
  return { id, category, name, kind, phone, due, details };
}

function call(id, at, name, phone, direction, outcome, notes, by) {
  return { id, at, name, phone, direction, outcome, notes, by };
}
