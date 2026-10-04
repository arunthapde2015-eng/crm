export const EXPENSE_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  // Kept on record with the reason; doesn't count towards spend.
  REJECTED: 'rejected',
};

export const EXPENSE_STATUS_LABELS = {
  [EXPENSE_STATUSES.PENDING]: 'Pending approval',
  [EXPENSE_STATUSES.APPROVED]: 'Approved',
  [EXPENSE_STATUSES.REJECTED]: 'Rejected',
};

export const EXPENSE_CATEGORIES = [
  'Office rent',
  'Internet & telephone',
  'Electricity',
  'Travel & conveyance',
  'Marketing',
  'Software subscriptions',
  'Office supplies',
  'Repairs & maintenance',
  'Professional fees',
  'Other',
];

// Expenses are numbered per Indian financial year: EXP-<FY start year>-<sequence>.
export const EXPENSE_NUMBER_PREFIX = 'EXP';
export const ALL_FILTER_VALUE = 'all';
export const MAX_REASON_LENGTH = 300;

const APPROVER = 'Anita Deshpande';
const RENT = ['Office rent', 'Pune Office Spaces LLP', 'Monthly office rent'];

// Placeholder expenses (amounts before GST). Numbers follow entry order, so they don't always
// follow the date.
// Formatting is skipped so each expense stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_EXPENSES = [
  expense('EXP-2026-0006', '2026-09-25', ...RENT, 'NEFT', 'RENT0', 45000, 18),
  expense('EXP-2026-0011', '2026-09-21', 'Internet & telephone', 'Airtel Business', 'Internet & telephone', 'UPI', '', 3500, 18),
  expense('EXP-2026-0010', '2026-09-15', 'Travel & conveyance', 'Indigo', 'Travel & conveyance', 'UPI', '', 9400, 5),
  expense('EXP-2026-0005', '2026-08-26', ...RENT, 'NEFT', 'RENT1', 45000, 18),
  expense('EXP-2026-0009', '2026-08-25', 'Marketing', 'Pune EdTech Expo', 'Marketing', 'UPI', '', 35000, 18),
  expense('EXP-2026-0004', '2026-07-27', ...RENT, 'NEFT', 'RENT2', 45000, 18),
  expense('EXP-2026-0008', '2026-07-25', 'Software subscriptions', 'CloudNine Hosting', 'Software subscriptions', 'UPI', '', 18000, 18),
  expense('EXP-2026-0003', '2026-06-27', ...RENT, 'NEFT', 'RENT3', 45000, 18),
  expense('EXP-2026-0007', '2026-06-12', 'Office supplies', 'Sai Stationers', 'Printer cartridges and stationery', 'Cash', '', 6200, 18),
  expense('EXP-2026-0002', '2026-05-27', ...RENT, 'NEFT', 'RENT4', 45000, 18),
  expense('EXP-2026-0001', '2026-04-27', ...RENT, 'NEFT', 'RENT5', 45000, 18),
];

function expense(number, date, category, vendor, description, mode, reference, amount, gstRate) {
  return {
    id: number,
    number,
    date,
    category,
    vendor,
    description,
    mode,
    reference,
    amount,
    gstRate,
    status: EXPENSE_STATUSES.APPROVED,
    submittedBy: APPROVER,
    approvedBy: APPROVER,
    rejectReason: '',
  };
}
