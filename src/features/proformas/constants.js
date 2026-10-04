import { COMPANY_STATE } from '@/constants/company';
import { addDays, parseIsoDate, toIsoDate } from '@/utils/formatDate';
import { DEFAULT_GST_RATE } from '@/utils/lineItems';

export const PROFORMA_STATUSES = {
  ISSUED: 'issued',
  CONVERTED: 'converted',
  CANCELLED: 'cancelled',
  // Never stored: shown for issued proformas whose validity has passed.
  EXPIRED: 'expired',
};

export const PROFORMA_STATUS_LABELS = {
  [PROFORMA_STATUSES.ISSUED]: 'Issued',
  [PROFORMA_STATUSES.CONVERTED]: 'Converted',
  [PROFORMA_STATUSES.CANCELLED]: 'Cancelled',
  [PROFORMA_STATUSES.EXPIRED]: 'Expired',
};

export const DEFAULT_VALIDITY_DAYS = 7;
export const PROFORMA_NUMBER_PREFIX = 'PI';
export const PROFORMA_NUMBER_DIGITS = 4;
export const ALL_FILTER_VALUE = 'all';

export const DEFAULT_TERMS =
  'Payment due before the validity date. Goods/services are supplied once payment is received. Subject to Pathri jurisdiction.';

const { ISSUED, CONVERTED } = PROFORMA_STATUSES;
const ZERO_GST = 0;

const MAULI = customer(
  'Mauli Nagri Sahakari Patsanstha Marya Majalgaon',
  '2 1, Near Water Tank, Swami Vivekanand Nagar, Majalgaon, Beed, Maharashtra - 431131',
  '9689814242',
  '',
  '27AAEAM3823E1ZT',
);
const SWARJY = customer(
  'SWARJY URBAN CO OP CREDIT SOCIETY LI PATHRI',
  'Main Road, Pathri, Parbhani, Maharashtra - 431506',
  '9823010021',
  '',
  '',
);

// Placeholder proformas until the billing API exists. Dates are ISO (YYYY-MM-DD).
// Formatting is skipped so each proforma stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_PROFORMAS = [
  proforma(1, '2026-09-05', customer('Vidya Vikas School Trust', 'Baner Road, Pune, Maharashtra - 411045', '9823010001', 'office@vidyavikas.org', '27AAATV1111V1Z5'), [item('AMC renewal - School fee software', 1, 54000, DEFAULT_GST_RATE, 'Annual maintenance for 2026-27', '998313')], CONVERTED, 1, 'QTN-2026-0003'),
  proforma(2, '2026-09-23', customer('Nirmal Credit Society, Head Office', 'Station Road, Parbhani, Maharashtra - 431401', '9823010003', 'accounts@nirmalcredit.in', '27AAAAN3333M1Z4'), [item('Custom API integration', 1, 71250, DEFAULT_GST_RATE, '', '998314')], ISSUED, 1, 'QTN-2026-0005'),
  proforma(3, '2026-09-27', SWARJY, [item('Dynamic QR standee kit', 6, 2500, DEFAULT_GST_RATE, '', '4911')], ISSUED, 1, ''),
  proforma(4, '2026-09-29', MAULI, [item('UPI Autopay and eNach Service CIBIL/Credit Score Verification', 1, 32500, ZERO_GST, 'AutoPay, eNACH, and CIBIL Verification Services.'), item('Wallet Balance', 1, 5000, ZERO_GST, 'For Transaction Charges')], ISSUED, 1, 'QTN-2026-0006'),
  proforma(5, '2026-09-29', SWARJY, [item('UPI Autopay and eNach Service CIBIL/Credit Score Verification', 1, 45000, DEFAULT_GST_RATE, 'AutoPay, eNACH, and CIBIL Verification Services.'), item('Wallet Balance', 1, 5000, DEFAULT_GST_RATE, 'For Transaction Charges')], ISSUED, 2, 'QTN-2026-0007'),
];

function customer(name, address, phone, email, gstin) {
  return { name, address, phone, email, gstin };
}

function item(product, quantity, unitPrice, gstRate, description = '', hsn = '') {
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

function proforma(sequence, date, buyer, items, status, revision, quotationRef) {
  const number = `${PROFORMA_NUMBER_PREFIX}-2026-${String(sequence).padStart(PROFORMA_NUMBER_DIGITS, '0')}`;
  return {
    id: number,
    number,
    date,
    validTill: toIsoDate(addDays(parseIsoDate(date), DEFAULT_VALIDITY_DAYS)),
    customer: buyer,
    placeOfSupply: COMPANY_STATE,
    salespersonId: 'rohan',
    items,
    discountPercent: 0,
    quotationRef,
    terms: DEFAULT_TERMS,
    status,
    revision,
  };
}
