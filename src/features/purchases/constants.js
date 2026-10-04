export const BILL_STATUSES = {
  UNPAID: 'unpaid',
  PAID: 'paid',
};

export const BILL_STATUS_LABELS = {
  [BILL_STATUSES.UNPAID]: 'Unpaid',
  [BILL_STATUSES.PAID]: 'Paid',
};

export const TAB_IDS = {
  BILLS: 'bills',
  VENDORS: 'vendors',
};

export const TABS = [
  { id: TAB_IDS.BILLS, label: 'Purchase bills' },
  { id: TAB_IDS.VENDORS, label: 'Vendors' },
];

// Purchase bills are numbered per Indian financial year: PUR-<FY start year>-<sequence>.
export const PURCHASE_NUMBER_PREFIX = 'PUR';
export const ALL_FILTER_VALUE = 'all';
export const DEFAULT_VENDOR_STATE = 'Maharashtra';

// Placeholder vendors and bills until purchases come from an accounting API.
// Formatting is skipped so each record stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_VENDORS = [
  vendor('axis-devices', 'Axis Devices Pvt. Ltd.', '27AAKCA5555D1Z3', 'Rajesh Mehta', '9823020001', 'sales@axisdevices.in', 'Maharashtra'),
  vendor('matrix-rolls', 'Matrix Paper Rolls', '27AAPFM6666E1Z8', 'Kiran Joshi', '9823020002', '', 'Maharashtra'),
];

// Amounts are before GST.
// prettier-ignore
export const INITIAL_BILLS = [
  bill('PUR-2026-0002', '2026-09-12', 'axis-devices', 'ADPL/2026/402', 'Smart POS terminals, 6 nos', 54000, 18, null),
  bill('PUR-2026-0001', '2026-07-09', 'axis-devices', 'ADPL/2026/318', 'Smart POS terminals, 10 nos', 90000, 18,
    { date: '2026-07-19', mode: 'NEFT', reference: 'UTR719260318' }),
];

function vendor(id, name, gstin, contactName, mobile, email, state) {
  return { id, name, gstin, contactName, mobile, email, state };
}

function bill(number, date, vendorId, vendorBillNumber, description, amount, gstRate, payment) {
  return {
    id: number,
    number,
    date,
    vendorId,
    vendorBillNumber,
    description,
    amount,
    gstRate,
    status: payment ? BILL_STATUSES.PAID : BILL_STATUSES.UNPAID,
    payment,
  };
}
