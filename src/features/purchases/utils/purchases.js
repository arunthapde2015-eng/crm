import { CASH_MODE } from '@/constants/payments';
import { GST_STATE_CODES } from '@/constants/states';
import { EMAIL_PATTERN, GSTIN_REGEX, MOBILE_PATTERN } from '@/constants/validation';
import { getNextDocumentNumber } from '@/utils/documentNumber';
import { formatDayMonthYear, parseIsoDate, toIsoDate } from '@/utils/formatDate';
import { DEFAULT_GST_RATE } from '@/utils/lineItems';

import {
  ALL_FILTER_VALUE,
  BILL_STATUSES,
  DEFAULT_VENDOR_STATE,
  PURCHASE_NUMBER_PREFIX,
} from '../constants';

const PERCENT = 100;
const { UNPAID, PAID } = BILL_STATUSES;

// ---- Money ---------------------------------------------------------------------

export function getGstAmount(bill) {
  return Math.round((bill.amount * bill.gstRate) / PERCENT);
}

export function getBillTotal(bill) {
  return bill.amount + getGstAmount(bill);
}

/** What's still owed to vendors: the totals of unpaid bills. */
export function getPayable(bills) {
  return bills
    .filter((bill) => bill.status === UNPAID)
    .reduce((sum, bill) => sum + getBillTotal(bill), 0);
}

export function findVendor(vendors, vendorId) {
  return vendors.find((vendor) => vendor.id === vendorId) ?? null;
}

// ---- Lists ---------------------------------------------------------------------

/** Text and status filters, newest first. */
export function filterBills(bills, vendors, { query, status }) {
  const normalizedQuery = query.trim().toLowerCase();
  return bills
    .filter((bill) => {
      const vendorName = findVendor(vendors, bill.vendorId)?.name ?? '';
      const searchable = [bill.number, bill.vendorBillNumber, bill.description, vendorName]
        .join(' ')
        .toLowerCase();
      return (
        searchable.includes(normalizedQuery) &&
        (status === ALL_FILTER_VALUE || bill.status === status)
      );
    })
    .sort(
      (first, second) =>
        second.date.localeCompare(first.date) || second.number.localeCompare(first.number),
    );
}

/** Vendors by name with how much was bought from each and what's still owed. */
export function getVendorRows(vendors, bills) {
  return [...vendors]
    .sort((first, second) => first.name.localeCompare(second.name))
    .map((vendor) => {
      const vendorBills = bills.filter((bill) => bill.vendorId === vendor.id);
      return {
        ...vendor,
        billCount: vendorBills.length,
        purchased: vendorBills.reduce((sum, bill) => sum + getBillTotal(bill), 0),
        payable: getPayable(vendorBills),
      };
    });
}

// ---- Bills ---------------------------------------------------------------------

export function getEmptyBillValues(today, vendorId = '') {
  return {
    vendorId,
    vendorBillNumber: '',
    date: toIsoDate(today),
    description: '',
    amount: '',
    gstRate: String(DEFAULT_GST_RATE),
  };
}

/** Problems with a new bill, or [] if it can be saved. A vendor's bill can only be entered once. */
export function validateBill(values, bills, vendors, todayIso) {
  const errors = [];
  const vendor = findVendor(vendors, values.vendorId);
  const vendorBillNumber = values.vendorBillNumber.trim();

  if (!vendor) errors.push('Choose the vendor.');
  if (vendorBillNumber === '') errors.push("Enter the vendor's bill number.");
  if (values.date === '') errors.push('Enter the bill date.');
  else if (values.date > todayIso) errors.push("The bill date can't be in the future.");
  if (values.description.trim() === '') errors.push('Describe what was bought.');
  if (!(Number(values.amount) > 0)) errors.push('Enter an amount greater than zero.');

  const duplicate = bills.find(
    (bill) =>
      bill.vendorId === values.vendorId &&
      bill.vendorBillNumber.toLowerCase() === vendorBillNumber.toLowerCase(),
  );
  if (vendor && vendorBillNumber !== '' && duplicate) {
    errors.push(
      `Bill ${vendorBillNumber} from ${vendor.name} is already entered as ${duplicate.number}.`,
    );
  }
  return errors;
}

export function createBill(values, bills) {
  const number = getNextDocumentNumber(
    bills.map((bill) => bill.number),
    PURCHASE_NUMBER_PREFIX,
    values.date,
  );
  return {
    id: number,
    number,
    date: values.date,
    vendorId: values.vendorId,
    vendorBillNumber: values.vendorBillNumber.trim(),
    description: values.description.trim(),
    amount: Number(values.amount),
    gstRate: Number(values.gstRate),
    status: UNPAID,
    payment: null,
  };
}

// ---- Paying --------------------------------------------------------------------

export function getEmptyPaymentValues(today) {
  return { date: toIsoDate(today), mode: 'NEFT', reference: '' };
}

/** The whole bill is paid at once, on or after the bill date, and not in the future. */
export function validatePayment(values, bill, bills, todayIso) {
  const errors = [];
  const reference = values.reference.trim();

  if (values.date === '') errors.push('Enter the payment date.');
  else if (values.date < bill.date) {
    errors.push(
      `The payment can't be before the bill date, ${formatDayMonthYear(parseIsoDate(bill.date))}.`,
    );
  } else if (values.date > todayIso) errors.push("The payment date can't be in the future.");

  if (values.mode !== CASH_MODE && reference === '') {
    errors.push('Enter the UTR, transaction ID or cheque number.');
  }
  const reused = bills.find(
    (other) =>
      reference !== '' && other.payment?.reference.toLowerCase() === reference.toLowerCase(),
  );
  if (reused) errors.push(`Reference ${reference} is already used on ${reused.number}.`);
  return errors;
}

export function payBill(bill, values) {
  return {
    ...bill,
    status: PAID,
    payment: { date: values.date, mode: values.mode, reference: values.reference.trim() },
  };
}

// ---- Vendors -------------------------------------------------------------------

export function getEmptyVendorValues() {
  return {
    name: '',
    gstin: '',
    contactName: '',
    mobile: '',
    email: '',
    state: DEFAULT_VENDOR_STATE,
  };
}

/** Problems with a new vendor. GSTIN is optional but must be valid and match the state. */
export function validateVendor(values, vendors) {
  const errors = [];
  const name = values.name.trim();
  const gstin = values.gstin.trim().toUpperCase();
  const mobile = values.mobile.trim();
  const email = values.email.trim();

  if (name === '') errors.push('Enter the vendor name.');
  else if (vendors.some((vendor) => vendor.name.toLowerCase() === name.toLowerCase())) {
    errors.push(`${name} is already a vendor.`);
  }
  if (gstin !== '' && !GSTIN_REGEX.test(gstin)) {
    errors.push('Enter a valid 15-character GSTIN.');
  } else if (gstin !== '' && gstin.slice(0, 2) !== GST_STATE_CODES[values.state]) {
    errors.push(`This GSTIN is not registered in ${values.state}.`);
  }
  if (mobile !== '' && !MOBILE_PATTERN.test(mobile)) errors.push('Enter a 10-digit mobile number.');
  if (email !== '' && !EMAIL_PATTERN.test(email)) errors.push('Enter a valid email address.');
  return errors;
}

/** Ids come from the name, with a suffix if two vendors would share one. */
export function createVendor(values, vendors) {
  const baseId = values.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const takenIds = new Set(vendors.map((vendor) => vendor.id));
  let id = baseId;
  for (let suffix = 2; takenIds.has(id); suffix += 1) id = `${baseId}-${suffix}`;
  return {
    id,
    name: values.name.trim(),
    gstin: values.gstin.trim().toUpperCase(),
    contactName: values.contactName.trim(),
    mobile: values.mobile.trim(),
    email: values.email.trim(),
    state: values.state,
  };
}
