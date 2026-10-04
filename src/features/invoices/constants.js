import { COMPANY_STATE } from '@/constants/company';
import { addDays, parseIsoDate, toIsoDate } from '@/utils/formatDate';
import { DEFAULT_GST_RATE } from '@/utils/lineItems';

// Stored statuses. Paid / partially paid / overdue are worked out from payments and dates.
export const INVOICE_STATUSES = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  PARTIALLY_PAID: 'partially-paid',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

export const INVOICE_STATUS_LABELS = {
  [INVOICE_STATUSES.DRAFT]: 'Draft',
  [INVOICE_STATUSES.ISSUED]: 'Issued',
  [INVOICE_STATUSES.PARTIALLY_PAID]: 'Partially Paid',
  [INVOICE_STATUSES.PAID]: 'Paid',
  [INVOICE_STATUSES.OVERDUE]: 'Overdue',
  [INVOICE_STATUSES.CANCELLED]: 'Cancelled',
};

export const INVOICE_KINDS = {
  SALES: 'sales',
  AMC: 'amc',
};

// Each kind has its own number series.
export const INVOICE_NUMBER_PREFIXES = {
  [INVOICE_KINDS.SALES]: 'INV',
  [INVOICE_KINDS.AMC]: 'AMC',
};

export const KIND_FILTERS = {
  ALL: 'all',
  SALES: INVOICE_KINDS.SALES,
  AMC: INVOICE_KINDS.AMC,
};

export const KIND_FILTER_LABELS = {
  [KIND_FILTERS.ALL]: 'Sales and AMC',
  [KIND_FILTERS.SALES]: 'Sales only',
  [KIND_FILTERS.AMC]: 'AMC only',
};

export const NOTE_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
};

export const NOTE_TYPE_LABELS = {
  [NOTE_TYPES.CREDIT]: 'Credit note',
  [NOTE_TYPES.DEBIT]: 'Debit note',
};

export const NOTE_NUMBER_PREFIXES = {
  [NOTE_TYPES.CREDIT]: 'CN',
  [NOTE_TYPES.DEBIT]: 'DN',
};

export const PAYMENT_MODES = ['Bank transfer', 'UPI', 'Cash', 'Cheque', 'Card', 'Other'];

export const DEFAULT_DUE_DAYS = 15;
export const NUMBER_DIGITS = 4;
export const ALL_FILTER_VALUE = 'all';
export const AMC_SAC_CODE = '998713';

export const DEFAULT_TERMS =
  'Payment due by the due date. Interest at 18% p.a. may be charged on overdue amounts. Subject to Pathri jurisdiction.';

const { DRAFT, ISSUED, CANCELLED } = INVOICE_STATUSES;
const { SALES, AMC } = INVOICE_KINDS;
const ZERO_GST = 0;

const VIDYA_BANER = customer(
  'Vidya Vikas School, Baner',
  'Pune',
  '9823010001',
  '',
  '27AAATV1111K1Z2',
);
const VIDYA_TRUST = customer(
  'Vidya Vikas School Trust',
  'Baner Road, Pune, Maharashtra - 411045',
  '9823010001',
  'office@vidyavikas.org',
  '27AAATV1111V1Z5',
);
const NIRMAL = customer(
  'Nirmal Co-operative Credit Society',
  'Station Road, Parbhani, Maharashtra - 431401',
  '9823010003',
  'accounts@nirmalcredit.in',
  '27AAAAN3333M1Z4',
);
const SAHYADRI = customer(
  'Sahyadri Multispeciality Clinic',
  'Jalna Road, Aurangabad, Maharashtra - 431001',
  '9823010002',
  '',
  '27AABFS2222S1Z8',
);

// Placeholder invoices until the billing API exists. Dates are ISO (YYYY-MM-DD).
// Formatting is skipped so each invoice stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_INVOICES = [
  invoice(SALES, 1, '2026-04-18', VIDYA_TRUST, 'rohan', [item('School fee collection software', 1, 120000, DEFAULT_GST_RATE, '998314')], ISSUED, [pay('2026-04-25', 141600, 'Bank transfer', 'NEFT-41825')]),
  invoice(SALES, 2, '2026-05-06', NIRMAL, 'rohan', [item('Custom API integration', 1, 150000, DEFAULT_GST_RATE, '998314')], ISSUED, [pay('2026-05-20', 177000, 'Bank transfer', 'RTGS-55102')]),
  invoice(AMC, 1, '2026-05-21', customer('Nirmal Credit Society, Head Office', 'Station Road, Parbhani, Maharashtra - 431401', '9823010003', '', '27AAAAN3333M1Z4'), 'rohan', [item('Annual maintenance charges, 21-05-2026 to 20-05-2027', 1, 22500, DEFAULT_GST_RATE, AMC_SAC_CODE)], ISSUED, [pay('2026-05-28', 26550, 'UPI', 'UPI-5528190')]),
  invoice(SALES, 3, '2026-06-12', SAHYADRI, 'sneha', [item('Payment gateway integration', 1, 120000, DEFAULT_GST_RATE, '998314'), item('Wallet Balance', 1, 15560, ZERO_GST, '', 'For Transaction Charges')], ISSUED, [pay('2026-06-30', 157160, 'Bank transfer', 'NEFT-63012')]),
  invoice(SALES, 4, '2026-07-14', customer('Konkan Fresh Mart', 'Station Road, Margao, Goa - 403601', '9823010004', '', '30AAGFK4444N1Z1'), 'sneha', [item('Merchant onboarding and setup', 1, 50000, DEFAULT_GST_RATE, '998314'), item('Smart POS terminal', 2, 2400, 12, '8470')], ISSUED, [pay('2026-08-02', 40000, 'UPI', 'UPI-8020411')], 'Goa'),
  invoice(SALES, 5, '2026-08-13', customer('Shreeji Textiles', 'Market Yard, Jalna, Maharashtra - 431203', '9823010022', '', ''), 'rohan', [item('GST billing software', 1, 62750, DEFAULT_GST_RATE, '998314')], ISSUED, [pay('2026-08-20', 35900, 'Cheque', 'CHQ-004188')]),
  invoice(SALES, 6, '2026-09-07', VIDYA_TRUST, 'rohan', [item('Fee collection module - 3 campuses', 1, 54000, DEFAULT_GST_RATE, '998314')], ISSUED, []),
  invoice(SALES, 7, '2026-09-19', NIRMAL, 'rohan', [item('Custom API integration - phase 2', 1, 40000, DEFAULT_GST_RATE, '998314')], ISSUED, [pay('2026-09-26', 20000, 'Bank transfer', 'NEFT-92611')]),
  invoice(SALES, 8, '2026-09-27', SAHYADRI, 'sneha', [item('Dynamic QR standee kit', 6, 2500, DEFAULT_GST_RATE, '4911')], DRAFT, []),
  invoice(SALES, 9, '2026-09-29', customer('SWARJY URBAN CO OP CREDIT SOCIETY LI PATHRI', 'Main Road, Pathri, Parbhani, Maharashtra - 431506', '9823010021', '', ''), 'rohan', [item('UPI Autopay and eNach Service', 1, 55000, DEFAULT_GST_RATE, '998314')], CANCELLED, []),
  invoice(AMC, 2, '2026-10-12', VIDYA_BANER, 'rohan', [item('Annual maintenance charges, 12-10-2026 to 11-10-2027', 1, 26000, DEFAULT_GST_RATE, AMC_SAC_CODE)], ISSUED, []),
];

function customer(name, address, phone, email, gstin) {
  return { name, address, phone, email, gstin };
}

function item(product, quantity, unitPrice, gstRate, hsn = '', description = '') {
  return {
    id: `${product}-${quantity}-${unitPrice}`,
    product,
    description,
    hsn,
    quantity,
    unitPrice,
    gstRate,
  };
}

function pay(date, amount, mode, reference) {
  return { id: `${date}-${amount}`, date, amount, mode, reference };
}

function invoice(
  kind,
  sequence,
  date,
  buyer,
  salespersonId,
  items,
  status,
  payments,
  placeOfSupply = COMPANY_STATE,
) {
  const number = `${INVOICE_NUMBER_PREFIXES[kind]}-2026-${String(sequence).padStart(NUMBER_DIGITS, '0')}`;
  return {
    id: number,
    number,
    kind,
    date,
    dueDate: toIsoDate(addDays(parseIsoDate(date), DEFAULT_DUE_DAYS)),
    customer: buyer,
    placeOfSupply,
    salespersonId,
    items,
    discountPercent: 0,
    terms: DEFAULT_TERMS,
    status,
    payments,
    notes: [],
  };
}
