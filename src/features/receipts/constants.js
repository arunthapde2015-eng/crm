export const RECEIPT_STATUSES = {
  CLEARED: 'cleared',
  // The money never arrived (cheque returned, transfer reversed).
  BOUNCED: 'bounced',
  // Entered by mistake.
  CANCELLED: 'cancelled',
};

export const RECEIPT_STATUS_LABELS = {
  [RECEIPT_STATUSES.CLEARED]: 'Cleared',
  [RECEIPT_STATUSES.BOUNCED]: 'Bounced',
  [RECEIPT_STATUSES.CANCELLED]: 'Cancelled',
};

export const DEPOSIT_ACCOUNTS = [
  'HDFC Bank current account',
  'SBI current account',
  'Cash in hand',
];
export const DEFAULT_BANK_ACCOUNT = DEPOSIT_ACCOUNTS[0];
export const CASH_ACCOUNT = 'Cash in hand';

// Receipts are numbered per Indian financial year: REC-<FY start year>-<sequence>.
export const RECEIPT_NUMBER_PREFIX = 'REC';
export const ALL_FILTER_VALUE = 'all';

// Invoices that receipts are recorded against: number, customer, contact, total.
// Placeholder until receipts and invoices come from the same billing API.
// Formatting is skipped so each invoice stays on one line and the seed data reads as a table.
// prettier-ignore
export const INVOICES = [
  invoice('INV-2026-0007', 'Nirmal Co-operative Credit Society', '9823010003', 'accounts@nirmalcredit.in', 47200),
  invoice('INV-2026-0006', 'Vidya Vikas School Trust', '9823010001', 'office@vidyavikas.org', 63720),
  invoice('INV-2026-0005', 'Shreeji Textiles', '9823010022', '', 74045),
  invoice('INV-2026-0004', 'Konkan Fresh Mart', '9823010004', '', 64376),
  invoice('INV-2026-0003', 'Sahyadri Multispeciality Clinic', '9823010002', '', 47790),
  invoice('INV-2026-0002', 'Nirmal Co-operative Credit Society', '9823010003', 'accounts@nirmalcredit.in', 177000),
  invoice('INV-2026-0001', 'Vidya Vikas School Trust', '9823010001', 'office@vidyavikas.org', 85180),
  invoice('AMC-2026-0002', 'Vidya Vikas School, Baner', '9823010001', '', 30680),
  invoice('AMC-2026-0001', 'Vidya Vikas School, Wakad', '9823010001', '', 28320),
  invoice('AMC-2025-0004', 'Nirmal Credit Society, Head Office', '9823010003', '', 42480),
  invoice('AMC-2025-0003', 'Konkan Fresh Mart, Panaji', '9823010004', '', 17700),
  invoice('INV-2025-0009', 'Sahyadri Multispeciality Clinic', '9823010002', '', 59000),
  invoice('INV-2025-0004', 'Vidya Vikas School Trust', '9823010001', 'office@vidyavikas.org', 21240),
  invoice('INV-2024-0021', 'Nirmal Co-operative Credit Society', '9823010003', 'accounts@nirmalcredit.in', 11800),
];

const HDFC = DEFAULT_BANK_ACCOUNT;

// Placeholder receipts. Numbers follow entry order within each financial year, so they don't
// always follow the date.
// prettier-ignore
export const INITIAL_RECEIPTS = [
  receipt('REC-2026-0007', '2026-09-24', 'INV-2026-0007', 'NEFT', 'UTR294034404', HDFC, 20000),
  receipt('REC-2026-0006', '2026-08-23', 'INV-2026-0005', 'Cheque', 'UTR233287703', HDFC, 30000),
  receipt('REC-2026-0005', '2026-07-29', 'INV-2026-0004', 'IMPS', 'UTR414374267', HDFC, 40000),
  receipt('REC-2026-0003', '2026-07-09', 'INV-2026-0002', 'RTGS', 'UTR658709677', HDFC, 71100),
  receipt('REC-2026-0004', '2026-06-19', 'INV-2026-0003', 'UPI', 'UTR855995583', HDFC, 47790),
  receipt('REC-2026-0008', '2026-06-09', 'AMC-2026-0001', 'NEFT', 'UTR262061441', HDFC, 28320),
  receipt('REC-2026-0002', '2026-05-30', 'INV-2026-0002', 'NEFT', 'UTR801027989', HDFC, 100000),
  receipt('REC-2026-0001', '2026-04-30', 'INV-2026-0001', 'NEFT', 'UTR604671949', HDFC, 85180),
  receipt('REC-2025-0004', '2026-02-14', 'AMC-2025-0004', 'NEFT', 'UTR406194386', HDFC, 42480),
  receipt('REC-2025-0003', '2025-12-31', 'AMC-2025-0003', 'NEFT', 'UTR522166890', HDFC, 17700),
  receipt('REC-2025-0002', '2025-10-15', 'INV-2025-0009', 'NEFT', 'UTR317745210', HDFC, 59000),
  receipt('REC-2025-0001', '2025-06-10', 'INV-2025-0004', 'UPI', 'UTR190625118', HDFC, 21240),
  receipt('REC-2024-0011', '2025-03-18', 'INV-2024-0021', 'Cheque', 'CHQ-000318', HDFC, 11800),
];

function invoice(number, customer, phone, email, total) {
  return { number, customer, phone, email, total };
}

function receipt(number, date, invoiceNumber, mode, reference, account, amount) {
  return {
    id: number,
    number,
    date,
    invoiceNumber,
    mode,
    reference,
    account,
    amount,
    status: RECEIPT_STATUSES.CLEARED,
    voidReason: '',
    voidDate: null,
  };
}
