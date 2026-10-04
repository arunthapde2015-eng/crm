export const MERCHANT_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const MERCHANT_STATUS_LABELS = {
  [MERCHANT_STATUSES.ACTIVE]: 'Active',
  [MERCHANT_STATUSES.INACTIVE]: 'Inactive',
};

export const MERCHANT_TYPES = {
  BUSINESS: 'business',
  INSTITUTION: 'institution',
  INDIVIDUAL: 'individual',
};

export const MERCHANT_TYPE_LABELS = {
  [MERCHANT_TYPES.BUSINESS]: 'Business',
  [MERCHANT_TYPES.INSTITUTION]: 'Institution',
  [MERCHANT_TYPES.INDIVIDUAL]: 'Individual',
};

// Linked record kinds in display order, with singular/plural labels.
// Outlet counts come from the merchant's outlet list; the rest are counts kept on the record.
export const LINKED_RECORD_KINDS = [
  { key: 'outlets', singular: 'outlet', plural: 'outlets' },
  { key: 'quotations', singular: 'quotation', plural: 'quotations' },
  { key: 'proformas', singular: 'proforma', plural: 'proformas' },
  { key: 'invoices', singular: 'invoice', plural: 'invoices' },
  { key: 'receipts', singular: 'receipt', plural: 'receipts' },
  { key: 'amcs', singular: 'AMC', plural: 'AMCs' },
];

// Lifecycle stages shown across the top of a merchant's detail panel, in order.
export const LIFECYCLE_STAGES = [
  { id: 'lead', label: 'Lead' },
  { id: 'merchant', label: 'Merchant' },
  { id: 'outlets', label: 'Outlet onboarding' },
  { id: 'quotations', label: 'Quotation' },
  { id: 'proformas', label: 'Proforma' },
  { id: 'invoices', label: 'Invoice' },
  { id: 'receipts', label: 'Payment' },
  { id: 'amcs', label: 'AMC' },
];

export const DETAIL_TAB_IDS = {
  OVERVIEW: 'overview',
  SALES: 'sales',
  PAYMENTS: 'payments',
  OUTLETS: 'outlets',
  LEDGER: 'ledger',
  TIMELINE: 'timeline',
  DOCUMENTS: 'documents',
};

export const MAX_REMARK_LENGTH = 500;

export const ALL_FILTER_VALUE = 'all';

export const DEFAULT_MERCHANT_FILTERS = {
  query: '',
  status: ALL_FILTER_VALUE,
  type: ALL_FILTER_VALUE,
  state: ALL_FILTER_VALUE,
  ownerId: ALL_FILTER_VALUE,
};

export const MERCHANT_NUMBER_PREFIX = 'MER';
export const MERCHANT_NUMBER_DIGITS = 4;
export const MOBILE_NUMBER_PATTERN = '[0-9]{10}';
export const COPY_NAME_SUFFIX = ' (copy)';

export const FORM_MODES = {
  ADD: 'add',
  EDIT: 'edit',
  COPY: 'copy',
};

const { BUSINESS, INSTITUTION } = MERCHANT_TYPES;

// Extra seed details by merchant sequence: when the record was created, whether it was
// converted from a lead, and its outlets (shops/branches that each get their own MID).
// Defined before INITIAL_MERCHANTS because building that list reads it.
const SEED_DETAILS = {
  1: { createdOn: '2026-04-12', isFromLead: true, outlets: [] },
  2: { createdOn: '2026-05-28', isFromLead: true, outlets: ['Sahyadri Clinic - OPD Counter'] },
  3: { createdOn: '2026-04-30', isFromLead: true, outlets: ['Nirmal Credit - Head Office'] },
  4: {
    createdOn: '2026-05-15',
    isFromLead: true,
    outlets: ['Konkan Fresh Mart - Margao', 'Konkan Fresh Mart - Panaji'],
  },
  5: { createdOn: '2026-06-02', isFromLead: false, outlets: ['Panchganga Agro - Kolhapur Depot'] },
  6: { createdOn: '2026-09-25', isFromLead: false, outlets: [] },
};

// Placeholder records until the merchants API exists.
// Formatting is skipped so each merchant stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_MERCHANTS = [
  merchant(1, 'Vidya Vikas School Trust', 'Pratibha Gokhale', '9823010001', INSTITUTION, '27AAATV1111V1Z5', 'Maharashtra', 120000, 0, { quotations: 1, invoices: 1, receipts: 2, amcs: 1 }, 'rohan'),
  merchant(2, 'Sahyadri Multispeciality Clinic', 'Dr. Amol Shinde', '9823010002', BUSINESS, '27AABFS2222S1Z8', 'Maharashtra', 60000, 10000, { quotations: 1, invoices: 1, receipts: 1 }, 'sneha'),
  merchant(3, 'Nirmal Co-operative Credit Society', 'Suresh Pawar', '9823010003', INSTITUTION, '27AAAAN3333M1Z4', 'Maharashtra', 303260, 27200, { invoices: 2, receipts: 3, amcs: 1 }, 'rohan'),
  merchant(4, 'Konkan Fresh Mart', 'Fatima Dsouza', '9823010004', BUSINESS, '30AAGFK4444N1Z1', 'Goa', 82076, 24376, { quotations: 1, invoices: 1, receipts: 1 }, 'sneha'),
  merchant(5, 'Panchganga Agro Traders', 'Mahantesh Patil', '9823010005', BUSINESS, '29AAKFP5555P1Z3', 'Karnataka', 145000, 0, { quotations: 2, invoices: 2, receipts: 2 }, 'vikram'),
  merchant(6, 'Mauli Nagri Sahakari Patsanstha Marya Majalgaon', 'Chairman', '9689814242', INSTITUTION, '27AAEAM3823E1ZT', 'Maharashtra', 0, 0, { quotations: 1, proformas: 1 }, 'rohan'),
];

function merchant(
  sequence,
  name,
  contactName,
  mobile,
  type,
  gstin,
  state,
  totalSales,
  outstanding,
  linkedRecords,
  ownerId,
) {
  const paddedSequence = String(sequence).padStart(MERCHANT_NUMBER_DIGITS, '0');
  const { createdOn, isFromLead, outlets } = SEED_DETAILS[sequence];
  return {
    id: `merchant-${sequence}`,
    number: `${MERCHANT_NUMBER_PREFIX}-2026-${paddedSequence}`,
    name,
    contactName,
    mobile,
    type,
    gstin,
    state,
    totalSales,
    outstanding,
    linkedRecords,
    ownerId,
    status: MERCHANT_STATUSES.ACTIVE,
    createdOn,
    isFromLead,
    outlets: outlets.map((outletName, index) => ({
      id: `merchant-${sequence}-outlet-${index + 1}`,
      name: outletName,
      addedOn: createdOn,
    })),
    remarks: [],
  };
}
