export const AMC_STATUSES = {
  ACTIVE: 'active',
  EXPIRING_SOON: 'expiring-soon',
  EXPIRED: 'expired',
  // The next year is already paid for.
  RENEWED: 'renewed',
  // A new merchant whose first AMC invoice is still unpaid.
  PENDING_FIRST_PAYMENT: 'pending-first-payment',
};

export const AMC_STATUS_LABELS = {
  [AMC_STATUSES.ACTIVE]: 'Active',
  [AMC_STATUSES.EXPIRING_SOON]: 'Expiring Soon',
  [AMC_STATUSES.EXPIRED]: 'Expired',
  [AMC_STATUSES.RENEWED]: 'Renewed',
  [AMC_STATUSES.PENDING_FIRST_PAYMENT]: 'Pending first payment',
};

// Days before expiry that a reminder goes out; 0 is the expiry date itself.
// Placeholder until the Settings "AMC reminders" tab stores this.
export const REMINDER_DAYS = [90, 60, 30, 15, 7, 0];
export const EXPIRING_SOON_DAYS = 30;
export const AMC_TERM_MONTHS = 12;

export const AMC_INVOICE_PREFIX = 'AMC';
export const ALL_FILTER_VALUE = 'all';

export const MERCHANT_STATUSES = {
  ACTIVE: 'active',
  ON_HOLD: 'on-hold',
  INACTIVE: 'inactive',
};

export const MERCHANT_STATUS_LABELS = {
  [MERCHANT_STATUSES.ACTIVE]: 'Active',
  [MERCHANT_STATUSES.ON_HOLD]: 'On hold',
  [MERCHANT_STATUSES.INACTIVE]: 'Inactive',
};

export const DOCUMENT_STATUSES = {
  VERIFIED: 'verified',
  UPLOADED: 'uploaded',
  MISSING: 'missing',
};

export const DOCUMENT_STATUS_LABELS = {
  [DOCUMENT_STATUSES.VERIFIED]: 'Verified',
  [DOCUMENT_STATUSES.UPLOADED]: 'Awaiting verification',
  [DOCUMENT_STATUSES.MISSING]: 'Missing',
};

export const DETAIL_TAB_IDS = {
  OVERVIEW: 'overview',
  AMC: 'amc',
  SALES: 'sales',
  PAYMENTS: 'payments',
  LEDGER: 'ledger',
  TIMELINE: 'timeline',
  DOCUMENTS: 'documents',
};

export const DETAIL_TABS = [
  { id: DETAIL_TAB_IDS.OVERVIEW, label: 'Overview' },
  { id: DETAIL_TAB_IDS.AMC, label: 'AMC' },
  { id: DETAIL_TAB_IDS.SALES, label: 'Sales' },
  { id: DETAIL_TAB_IDS.PAYMENTS, label: 'Payments' },
  { id: DETAIL_TAB_IDS.LEDGER, label: 'Ledger' },
  { id: DETAIL_TAB_IDS.TIMELINE, label: 'Timeline' },
  { id: DETAIL_TAB_IDS.DOCUMENTS, label: 'Documents' },
];

export const MAX_REMARK_LENGTH = 500;
// Marking an invoice paid on this page doesn't capture how it was paid.
export const UNRECORDED_PAYMENT_MODE = 'Marked paid';

const { VERIFIED } = DOCUMENT_STATUSES;

// Placeholder AMC contracts, one per merchant outlet. Each period is one year's AMC invoice
// (amounts before GST); sales and payments are what the outlet has been billed and has paid.
// Formatting is skipped so each record stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_CONTRACTS = [
  {
    ...outlet('MER-2025-0002', 'Sahyadri Clinic, Kothrud', '2025-08-23', 'sneha'),
    ...customer('CUS-2026-0002', 'Sahyadri Multispeciality Clinic', '27AAFCS2222L1Z9'),
    ...contact('Dr. Amol Shinde', '9823010002', 'dr.amol.shinde@example.in', 'Pune, Maharashtra'),
    product: 'Payment gateway integration',
    periods: [period('AMC-2025-0001', '2025-08-23', '2025-08-23', '2026-08-22', 18000, true)],
    sales: [sale('INV-2025-0009', '2025-08-23', 'Payment gateway integration setup', 59000)],
    payments: [
      payment('2025-08-30', 'AMC-2025-0001', 'NEFT', 'UTR118230825', 21240),
      payment('2025-10-15', 'INV-2025-0009', 'NEFT', 'UTR317745210', 59000),
    ],
    documents: standardDocuments('2025-08-20'),
    activity: [],
  },
  {
    ...outlet('MER-2025-0001', 'Vidya Vikas School, Baner', '2025-10-12', 'rohan'),
    ...customer('CUS-2025-0001', 'Vidya Vikas School Trust', '27AAATV1111V1Z5'),
    ...contact('Pratibha Gokhale', '9823010001', 'office@vidyavikas.org', 'Baner, Pune, Maharashtra'),
    product: 'School fee collection',
    periods: [
      period('AMC-2025-0002', '2025-10-12', '2025-10-12', '2026-10-11', 24000, true),
      period('AMC-2026-0002', '2026-09-12', '2026-10-12', '2027-10-11', 26000, false),
    ],
    sales: [sale('INV-2025-0004', '2025-06-02', 'School fee collection setup', 21240)],
    payments: [
      payment('2025-06-10', 'INV-2025-0004', 'UPI', 'UTR190625118', 21240),
      payment('2025-10-20', 'AMC-2025-0002', 'NEFT', 'UTR520251020', 28320),
    ],
    documents: standardDocuments('2025-10-06'),
    activity: [remark('2026-09-12', 'Renewal quoted at ₹26,000 for the added fee-reminder module.', 'Rohan Kulkarni')],
  },
  {
    ...outlet('MER-2025-0003', 'Konkan Fresh Mart, Panaji', '2025-12-21', 'sneha'),
    ...customer('CUS-2025-0004', 'Konkan Fresh Mart', '30AAGFK4444N1Z1'),
    ...contact('Fatima Dsouza', '9823010004', '', 'Panaji, Goa'),
    product: 'POS and UPI collection',
    periods: [period('AMC-2025-0003', '2025-12-21', '2025-12-21', '2026-12-20', 15000, true)],
    sales: [],
    payments: [payment('2025-12-31', 'AMC-2025-0003', 'NEFT', 'UTR522166890', 17700)],
    documents: standardDocuments('2025-12-15'),
    activity: [],
  },
  {
    ...outlet('MER-2024-0001', 'Nirmal Credit Society, Head Office', '2025-02-04', 'rohan'),
    ...customer('CUS-2024-0003', 'Nirmal Co-operative Credit Society', '27AAAAN3333M1Z4'),
    ...contact('Suresh Pawar', '9823010003', 'accounts@nirmalcredit.in', 'Shivajinagar, Pune, Maharashtra'),
    product: 'Loan EMI collection',
    periods: [
      period('AMC-2024-0006', '2025-02-04', '2025-02-04', '2026-02-03', 36000, true),
      period('AMC-2025-0004', '2026-01-05', '2026-02-04', '2027-02-03', 36000, true),
    ],
    sales: [sale('INV-2024-0021', '2025-02-04', 'Loan EMI collection setup', 11800)],
    payments: [
      payment('2025-02-15', 'AMC-2024-0006', 'NEFT', 'UTR150225601', 42480),
      payment('2025-03-18', 'INV-2024-0021', 'Cheque', 'CHQ-000318', 11800),
      payment('2026-02-14', 'AMC-2025-0004', 'NEFT', 'UTR406194386', 42480),
    ],
    documents: standardDocuments('2025-01-28'),
    activity: [],
  },
  {
    ...outlet('MER-2026-0001', 'Vidya Vikas School, Wakad', '2026-05-30', 'rohan'),
    ...customer('CUS-2025-0001', 'Vidya Vikas School Trust', '27AAATV1111V1Z5'),
    ...contact('Pratibha Gokhale', '9823010001', 'office@vidyavikas.org', 'Wakad, Pune, Maharashtra'),
    product: 'School fee collection',
    periods: [period('AMC-2026-0001', '2026-05-30', '2026-05-30', '2027-05-29', 24000, true)],
    sales: [],
    payments: [payment('2026-06-09', 'AMC-2026-0001', 'NEFT', 'UTR262061441', 28320)],
    documents: standardDocuments('2026-05-25'),
    activity: [],
  },
];

function outlet(merchantCode, merchantName, onboardedDate, assignedTo) {
  return {
    id: merchantCode,
    merchantCode,
    merchantName,
    onboardedDate,
    assignedTo,
    status: MERCHANT_STATUSES.ACTIVE,
  };
}

function customer(customerCode, customerName, gstin) {
  return { customerCode, customerName, gstin };
}

function contact(contactName, mobile, email, address) {
  return { contactName, mobile, email, address };
}

function period(invoiceNumber, invoiceDate, start, end, amount, isPaid) {
  return { invoiceNumber, invoiceDate, start, end, amount, isPaid };
}

function sale(invoiceNumber, date, description, total) {
  return { invoiceNumber, date, description, total };
}

function payment(date, invoiceNumber, mode, reference, amount) {
  return { date, invoiceNumber, mode, reference, amount };
}

function remark(date, text, by) {
  return { id: `${date}-${text}`, date, text, by, isRemark: true };
}

function standardDocuments(date) {
  return ['GST certificate', 'PAN card', 'Cancelled cheque', 'AMC agreement'].map((name) => ({
    name,
    date,
    status: VERIFIED,
  }));
}
