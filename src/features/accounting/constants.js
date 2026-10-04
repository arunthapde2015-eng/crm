export const ACCOUNT_TYPES = {
  ASSET: 'asset',
  LIABILITY: 'liability',
  EQUITY: 'equity',
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const ACCOUNT_TYPE_LABELS = {
  [ACCOUNT_TYPES.ASSET]: 'Assets',
  [ACCOUNT_TYPES.LIABILITY]: 'Liabilities',
  [ACCOUNT_TYPES.EQUITY]: 'Capital',
  [ACCOUNT_TYPES.INCOME]: 'Income',
  [ACCOUNT_TYPES.EXPENSE]: 'Expenses',
};

export const VOUCHER_TYPES = {
  SALES: 'sales',
  RECEIPT: 'receipt',
  PURCHASE: 'purchase',
  PAYMENT: 'payment',
  CONTRA: 'contra',
  JOURNAL: 'journal',
};

export const VOUCHER_TYPE_DETAILS = {
  [VOUCHER_TYPES.SALES]: { label: 'Sales', prefix: 'SV' },
  [VOUCHER_TYPES.RECEIPT]: { label: 'Receipt', prefix: 'RV' },
  [VOUCHER_TYPES.PURCHASE]: { label: 'Purchase', prefix: 'PU' },
  [VOUCHER_TYPES.PAYMENT]: { label: 'Payment', prefix: 'PV' },
  // Money moved between the company's own bank and cash accounts.
  [VOUCHER_TYPES.CONTRA]: { label: 'Contra', prefix: 'CV' },
  [VOUCHER_TYPES.JOURNAL]: { label: 'Journal', prefix: 'JV' },
};

export const VOUCHER_STATUSES = {
  POSTED: 'posted',
  // Kept on record with the reason; left out of every balance.
  CANCELLED: 'cancelled',
};

export const BANK_ACCOUNT_TYPES = ['Current', 'Savings', 'Overdraft'];
export const BANK_GROUP = 'Bank accounts';
export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const ACCOUNT_NUMBER_PATTERN = /^\d{9,18}$/;
export const VISIBLE_ACCOUNT_DIGITS = 4;

// The books start with this financial year; opening balances are as at this date.
export const BOOKS_START_DATE = '2026-04-01';
export const ALL_FILTER_VALUE = 'all';
export const MIN_VOUCHER_LINES = 2;
export const MAX_REASON_LENGTH = 300;

export const CASH_CODE = '1030';
export const RECEIVABLES_CODE = '1100';
export const INPUT_GST_CODE = '1200';
export const PAYABLES_CODE = '2100';
export const OUTPUT_GST_CODE = '2200';

const { ASSET, LIABILITY, EQUITY, INCOME, EXPENSE } = ACCOUNT_TYPES;

// Ledger accounts other than banks, which come from Manage banks. Opening balances are as at
// BOOKS_START_DATE: positive is a debit balance, negative a credit balance.
// Formatting is skipped so each account stays on one line and the chart reads as a table.
// prettier-ignore
export const CHART_OF_ACCOUNTS = [
  account(CASH_CODE, 'Cash in hand', ASSET, 'Cash', 15000, true),
  account(RECEIVABLES_CODE, 'Trade receivables', ASSET, 'Sundry debtors', 35000),
  account(INPUT_GST_CODE, 'Input GST', ASSET, 'Duties & taxes'),
  account(PAYABLES_CODE, 'Trade payables', LIABILITY, 'Sundry creditors'),
  account(OUTPUT_GST_CODE, 'Output GST', LIABILITY, 'Duties & taxes'),
  account('2300', 'Salaries payable', LIABILITY, 'Current liabilities'),
  account('3000', 'Capital account', EQUITY, 'Capital', -500000),
  account('4000', 'Software sales', INCOME, 'Sales'),
  account('4100', 'AMC income', INCOME, 'Sales'),
  account('5000', 'Purchases', EXPENSE, 'Direct expenses'),
  account('5100', 'Office rent', EXPENSE, 'Indirect expenses'),
  account('5110', 'Internet & telephone', EXPENSE, 'Indirect expenses'),
  account('5120', 'Travel & conveyance', EXPENSE, 'Indirect expenses'),
  account('5130', 'Marketing', EXPENSE, 'Indirect expenses'),
  account('5140', 'Software subscriptions', EXPENSE, 'Indirect expenses'),
  account('5150', 'Office supplies', EXPENSE, 'Indirect expenses'),
  account('5160', 'Salaries', EXPENSE, 'Indirect expenses'),
  account('5170', 'Bank charges', EXPENSE, 'Indirect expenses'),
];

// prettier-ignore
export const INITIAL_BANKS = [
  bank('1010', 'HDFC Bank current account', 'HDFC Bank', '50200012345678', 'HDFC0001234', 'Pune, FC Road', 'Current', 380000),
  bank('1020', 'SBI current account', 'State Bank of India', '38912345678', 'SBIN0011234', 'Pathri', 'Current', 70000),
];

const HDFC = '1010';
const SBI = '1020';
const RENT = '5100';
const { SALES, RECEIPT, PURCHASE, PAYMENT, CONTRA, JOURNAL } = VOUCHER_TYPES;

// Placeholder vouchers for this financial year: sales and AMC invoices, receipts, purchase
// bills, and the expenses paid.
// prettier-ignore
export const INITIAL_VOUCHERS = [
  voucher('SV-2026-0001', SALES, '2026-04-30', 'INV-2026-0001, Vidya Vikas School Trust', '', [dr(RECEIVABLES_CODE, 84960), cr('4000', 72000), cr(OUTPUT_GST_CODE, 12960)]),
  voucher('PV-2026-0001', PAYMENT, '2026-04-27', 'April office rent, Pune Office Spaces LLP', 'RENT5', rent(HDFC)),
  voucher('RV-2026-0001', RECEIPT, '2026-05-08', 'Vidya Vikas School Trust, against INV-2026-0001', 'UTR604671949', [dr(HDFC, 84960), cr(RECEIVABLES_CODE, 84960)]),
  voucher('PV-2026-0002', PAYMENT, '2026-05-27', 'May office rent, Pune Office Spaces LLP', 'RENT4', rent(HDFC)),
  voucher('SV-2026-0002', SALES, '2026-06-09', 'AMC-2026-0001, Vidya Vikas School, Wakad', '', [dr(RECEIVABLES_CODE, 28320), cr('4100', 24000), cr(OUTPUT_GST_CODE, 4320)]),
  voucher('RV-2026-0002', RECEIPT, '2026-06-09', 'Vidya Vikas School, Wakad, against AMC-2026-0001', 'UTR262061441', [dr(HDFC, 28320), cr(RECEIVABLES_CODE, 28320)]),
  voucher('PV-2026-0003', PAYMENT, '2026-06-12', 'Printer cartridges and stationery, Sai Stationers', '', [dr('5150', 6200), dr(INPUT_GST_CODE, 1116), cr(CASH_CODE, 7316)]),
  voucher('PV-2026-0004', PAYMENT, '2026-06-27', 'June office rent, Pune Office Spaces LLP', 'RENT3', rent(HDFC)),
  voucher('PU-2026-0001', PURCHASE, '2026-07-09', 'Smart POS terminals, 10 nos, Axis Devices, bill ADPL/2026/318', '', [dr('5000', 90000), dr(INPUT_GST_CODE, 16200), cr(PAYABLES_CODE, 106200)]),
  voucher('PV-2026-0005', PAYMENT, '2026-07-19', 'Axis Devices Pvt. Ltd., bill ADPL/2026/318', 'UTR719260318', [dr(PAYABLES_CODE, 106200), cr(HDFC, 106200)]),
  voucher('SV-2026-0003', SALES, '2026-07-20', 'INV-2026-0002, Nirmal Co-operative Credit Society', '', [dr(RECEIVABLES_CODE, 177000), cr('4000', 150000), cr(OUTPUT_GST_CODE, 27000)]),
  voucher('PV-2026-0006', PAYMENT, '2026-07-25', 'Hosting, CloudNine Hosting', '', [dr('5140', 18000), dr(INPUT_GST_CODE, 3240), cr(HDFC, 21240)]),
  voucher('PV-2026-0007', PAYMENT, '2026-07-27', 'July office rent, Pune Office Spaces LLP', 'RENT2', rent(HDFC)),
  voucher('RV-2026-0003', RECEIPT, '2026-08-05', 'Nirmal Co-operative Credit Society, part of INV-2026-0002', 'UTR801027989', [dr(HDFC, 100000), cr(RECEIVABLES_CODE, 100000)]),
  voucher('CV-2026-0001', CONTRA, '2026-08-10', 'Cash withdrawn for petty cash', 'CHQ-000412', [dr(CASH_CODE, 20000), cr(HDFC, 20000)]),
  voucher('PV-2026-0008', PAYMENT, '2026-08-25', 'Stall at Pune EdTech Expo', '', [dr('5130', 35000), dr(INPUT_GST_CODE, 6300), cr(HDFC, 41300)]),
  voucher('PV-2026-0009', PAYMENT, '2026-08-26', 'August office rent, Pune Office Spaces LLP', 'RENT1', rent(HDFC)),
  voucher('PU-2026-0002', PURCHASE, '2026-09-12', 'Smart POS terminals, 6 nos, Axis Devices, bill ADPL/2026/402', '', [dr('5000', 54000), dr(INPUT_GST_CODE, 9720), cr(PAYABLES_CODE, 63720)]),
  voucher('PV-2026-0010', PAYMENT, '2026-09-15', 'Air tickets, Indigo', '', [dr('5120', 9400), dr(INPUT_GST_CODE, 470), cr(HDFC, 9870)]),
  voucher('PV-2026-0011', PAYMENT, '2026-09-21', 'Internet & telephone, Airtel Business', '', [dr('5110', 3500), dr(INPUT_GST_CODE, 630), cr(SBI, 4130)]),
  voucher('PV-2026-0012', PAYMENT, '2026-09-25', 'September office rent, Pune Office Spaces LLP', 'RENT0', rent(HDFC)),
  voucher('JV-2026-0001', JOURNAL, '2026-09-30', 'September salaries due', '', [dr('5160', 120000), cr('2300', 120000)]),
];

function account(code, name, type, group, opening = 0, isMoney = false) {
  return { code, name, type, group, opening, isMoney };
}

function bank(code, name, bankName, accountNumber, ifsc, branch, accountType, openingBalance) {
  return {
    code,
    name,
    bankName,
    accountNumber,
    ifsc,
    branch,
    accountType,
    openingBalance,
    isActive: true,
  };
}

function voucher(number, type, date, narration, reference, lines) {
  return {
    id: number,
    number,
    type,
    date,
    narration,
    reference,
    lines,
    status: VOUCHER_STATUSES.POSTED,
    cancelReason: '',
  };
}

function dr(accountCode, amount) {
  return { accountCode, debit: amount, credit: 0 };
}

function cr(accountCode, amount) {
  return { accountCode, debit: 0, credit: amount };
}

function rent(bankCode) {
  return [dr(RENT, 45000), dr(INPUT_GST_CODE, 8100), cr(bankCode, 53100)];
}
