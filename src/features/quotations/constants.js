import { COMPANY_STATE } from '@/constants/company';
import { addDays, parseIsoDate, toIsoDate } from '@/utils/formatDate';
import { DEFAULT_GST_RATE } from '@/utils/lineItems';

export const QUOTATION_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CONVERTED: 'converted',
  // Never stored: shown for sent quotations whose validity has passed.
  EXPIRED: 'expired',
};

export const QUOTATION_STATUS_LABELS = {
  [QUOTATION_STATUSES.DRAFT]: 'Draft',
  [QUOTATION_STATUSES.SENT]: 'Sent',
  [QUOTATION_STATUSES.ACCEPTED]: 'Accepted',
  [QUOTATION_STATUSES.REJECTED]: 'Rejected',
  [QUOTATION_STATUSES.CONVERTED]: 'Converted',
  [QUOTATION_STATUSES.EXPIRED]: 'Expired',
};

export const APPROVAL_STATUSES = {
  NOT_NEEDED: 'not-needed',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const APPROVAL_LABELS = {
  [APPROVAL_STATUSES.NOT_NEEDED]: 'Not needed',
  [APPROVAL_STATUSES.PENDING]: 'Awaiting approval',
  [APPROVAL_STATUSES.APPROVED]: 'Approved',
  [APPROVAL_STATUSES.REJECTED]: 'Approval rejected',
};

// Discounts at or above this need a manager's approval before the quotation can be sent.
export const APPROVAL_DISCOUNT_PERCENT = 10;
export const DEFAULT_VALIDITY_DAYS = 15;
export const QUOTATION_NUMBER_PREFIX = 'QTN';
export const QUOTATION_NUMBER_DIGITS = 4;
export const PERCENT = 100;
export const ALL_FILTER_VALUE = 'all';

export const DEFAULT_TERMS =
  'Prices valid until the date shown. 50% advance on confirmation, balance on go-live. GST extra as applicable.';

// Optional bullet sections printed after the price table (charges, AMC, notes...).
// Reused by the AutoPay / eNACH / CIBIL proposals below.
const FINTECH_SECTIONS = [
  section('Transaction Charges (Exclusive of GST)', [
    '**AutoPay & eNACH**',
    'Daily Transactions: ₹3 + GST per transaction',
    'Weekly Transactions: ₹15 + GST per transaction',
    'Monthly Transactions: ₹20 + GST per transaction',
  ]),
  section('CIBIL Verification', [
    'TransUnion CIBIL Report: ₹150 + GST per inquiry',
    'CRIF High Mark Report: ₹100 + GST per inquiry',
  ]),
  section('Annual Maintenance Charges (AMC)', [
    'First Year: **FREE**',
    'From the second year onwards: ₹12,000 + GST per branch, per annum.',
  ]),
  section('Notes', [
    'GST will be charged as applicable.',
    'The above commercials are applicable for AutoPay, eNACH Mandate, and CIBIL Verification services.',
    'Any additional customization, API integration, or implementation requested beyond the standard offering will be charged separately.',
  ]),
];

const { DRAFT, SENT, ACCEPTED, REJECTED, CONVERTED } = QUOTATION_STATUSES;
const { NOT_NEEDED, PENDING } = APPROVAL_STATUSES;

// Placeholder quotations until the quotations API exists. Dates are ISO (YYYY-MM-DD).
// Formatting is skipped so each quotation stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_QUOTATIONS = [
  quotation(1, '2026-09-24', 'Shreeji Textiles', 'rohan', [item('GST billing software', 3, 32500)], 10, DRAFT, 1, PENDING),
  quotation(2, '2026-09-18', 'Sahyadri Multispeciality Clinic', 'sneha', [item('Payment gateway integration', 1, 60000), item('Card swipe device', 1, 8000, 12)], 0, SENT, 1, NOT_NEEDED),
  quotation(3, '2026-09-03', 'Vidya Vikas School Trust', 'rohan', [item('AMC renewal - School fee software', 1, 54000)], 0, CONVERTED, 1, NOT_NEEDED),
  quotation(4, '2026-08-28', 'Laxmi Textiles', 'vikram', [item('GST billing software', 1, 37500)], 0, REJECTED, 1, NOT_NEEDED),
  quotation(5, '2026-09-22', 'Nirmal Credit Society, Head Office', 'rohan', [item('Custom API integration', 1, 71250)], 0, CONVERTED, 1, NOT_NEEDED),
  quotation(6, '2026-09-26', 'Mauli Nagri Sahakari Patsanstha Marya Majalgaon', 'rohan', [item('Smart POS terminal', 5, 13000)], 0, ACCEPTED, 1, NOT_NEEDED),
  quotation(7, '2026-09-29', 'SWARJY URBAN CO OP CREDIT SOCIETY LI PATHRI', 'rohan', [item('UPI Autopay and eNach Service CIBIL/Credit Score Verification', 1, 45000, DEFAULT_GST_RATE, 'AutoPay, eNACH, and CIBIL Verification Services.'), item('Wallet Balance', 1, 5000, DEFAULT_GST_RATE, 'For Transaction Charges')], 0, CONVERTED, 2, NOT_NEEDED, FINTECH_SECTIONS),
  quotation(8, '2026-09-29', 'SWARJY URBAN CO OP CREDIT SOCIETY LI PATHRI', 'rohan', [item('UPI Autopay and eNach Service', 1, 55000, DEFAULT_GST_RATE, 'Mandate registration and recurring collections.')], 0, CONVERTED, 2, NOT_NEEDED, FINTECH_SECTIONS),
];

// GST is set per line, because different products and services carry different rates.
// The optional description prints in italics under the product name.
function item(product, quantity, unitPrice, gstRate = DEFAULT_GST_RATE, description = '') {
  return {
    id: `${product}-${quantity}-${unitPrice}`,
    product,
    description,
    quantity,
    unitPrice,
    gstRate,
  };
}

function section(title, points) {
  return { id: title, title, points };
}

function quotation(
  sequence,
  date,
  customer,
  salespersonId,
  items,
  discountPercent,
  status,
  revision,
  approval,
  sections = [],
) {
  const number = `${QUOTATION_NUMBER_PREFIX}-2026-${String(sequence).padStart(QUOTATION_NUMBER_DIGITS, '0')}`;
  return {
    id: number,
    number,
    date,
    validUntil: toIsoDate(addDays(parseIsoDate(date), DEFAULT_VALIDITY_DAYS)),
    customer,
    // Place of supply decides CGST + SGST (same state as the company) or IGST.
    placeOfSupply: COMPANY_STATE,
    salespersonId,
    items,
    discountPercent,
    sections,
    terms: DEFAULT_TERMS,
    status,
    revision,
    approval,
  };
}
