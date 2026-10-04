import { EMAIL_PATTERN, MOBILE_PATTERN } from '@/constants/validation';
import { addDays, formatDayMonthYear, parseIsoDate, toIsoDate } from '@/utils/formatDate';

import { AMC_STATUSES, DOCUMENT_STATUSES, REMINDER_DAYS } from '../constants';
import { getCurrentPeriod, getRenewalToShow, getStatus, withGst } from './amc';

const formatDate = (isoDate) => formatDayMonthYear(parseIsoDate(isoDate));
const AMC_RUNNING_STATUSES = [
  AMC_STATUSES.ACTIVE,
  AMC_STATUSES.EXPIRING_SOON,
  AMC_STATUSES.RENEWED,
];

// ---- Lifecycle -----------------------------------------------------------------

/** Chevron stages from customer to renewed, each done or not as of today. */
export function getLifecycleStages(contract, todayIso) {
  const status = getStatus(contract, todayIso);
  const { documents } = contract;
  return [
    { id: 'customer', label: 'Customer', isDone: Boolean(contract.customerCode) },
    {
      id: 'documents',
      label: 'Documents',
      isDone: documents.every((doc) => doc.status !== DOCUMENT_STATUSES.MISSING),
    },
    {
      id: 'verified',
      label: 'Verified',
      isDone: documents.every((doc) => doc.status === DOCUMENT_STATUSES.VERIFIED),
    },
    { id: 'onboarded', label: 'Onboarded', isDone: contract.onboardedDate <= todayIso },
    { id: 'amc-active', label: 'AMC active', isDone: AMC_RUNNING_STATUSES.includes(status) },
    {
      id: 'renewal-billed',
      label: 'Renewal billed',
      isDone: getRenewalToShow(contract, todayIso) !== null,
    },
    { id: 'renewed', label: 'Renewed', isDone: status === AMC_STATUSES.RENEWED },
  ];
}

// ---- AMC -----------------------------------------------------------------------

/** When each reminder for the current AMC year goes out, and whether it has gone. */
export function getReminderSchedule(contract, todayIso) {
  const end = parseIsoDate(getCurrentPeriod(contract, todayIso).end);
  return REMINDER_DAYS.map((days) => {
    const date = toIsoDate(addDays(end, -days));
    return {
      id: String(days),
      label: days === 0 ? 'On the expiry date' : `${days} days before`,
      date,
      isSent: date <= todayIso,
    };
  });
}

// ---- Money ---------------------------------------------------------------------

export function getPaidAmount(contract, invoiceNumber) {
  return contract.payments
    .filter((payment) => payment.invoiceNumber === invoiceNumber)
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function getPaymentsNewestFirst(contract) {
  return [...contract.payments].sort((first, second) => second.date.localeCompare(first.date));
}

/**
 * Invoices (debits) and payments (credits) in date order with a running balance. On the same
 * day an invoice comes before the payment against it.
 */
export function getLedger(contract) {
  const amcEntries = contract.periods.map((period) => ({
    id: period.invoiceNumber,
    date: period.invoiceDate,
    description: `AMC invoice ${period.invoiceNumber}, ${formatDate(period.start)} to ${formatDate(period.end)}`,
    debit: withGst(period.amount),
    credit: 0,
  }));
  const saleEntries = contract.sales.map((sale) => ({
    id: sale.invoiceNumber,
    date: sale.date,
    description: `Invoice ${sale.invoiceNumber}, ${sale.description}`,
    debit: sale.total,
    credit: 0,
  }));
  const paymentEntries = contract.payments.map((payment, index) => ({
    id: `payment-${index}`,
    date: payment.date,
    description: `Payment against ${payment.invoiceNumber}, ${payment.mode}${payment.reference ? ` ${payment.reference}` : ''}`,
    debit: 0,
    credit: payment.amount,
  }));

  let balance = 0;
  const rows = [...amcEntries, ...saleEntries, ...paymentEntries]
    .sort((first, second) => first.date.localeCompare(second.date) || second.debit - first.debit)
    .map((entry) => {
      balance += entry.debit - entry.credit;
      return { ...entry, balance };
    });

  return {
    rows,
    debit: rows.reduce((sum, row) => sum + row.debit, 0),
    credit: rows.reduce((sum, row) => sum + row.credit, 0),
    balance,
  };
}

// ---- Timeline ------------------------------------------------------------------

/** Everything that has happened with this outlet, newest first. */
export function getTimelineEvents(contract) {
  const events = [
    { id: 'onboarded', date: contract.onboardedDate, text: 'Onboarded as a merchant outlet.' },
    ...contract.periods.map((period) => ({
      id: `amc-${period.invoiceNumber}`,
      date: period.invoiceDate,
      text: `AMC invoice ${period.invoiceNumber} raised for ${formatDate(period.start)} to ${formatDate(period.end)}.`,
    })),
    ...contract.sales.map((sale) => ({
      id: `sale-${sale.invoiceNumber}`,
      date: sale.date,
      text: `Invoice ${sale.invoiceNumber} raised: ${sale.description}.`,
    })),
    ...contract.payments.map((payment, index) => ({
      id: `payment-${index}`,
      date: payment.date,
      text: `Payment received against ${payment.invoiceNumber}.`,
      amount: payment.amount,
    })),
    ...contract.activity,
  ];
  return events.sort((first, second) => second.date.localeCompare(first.date));
}

export function getLatestRemark(contract) {
  return contract.activity.filter((entry) => entry.isRemark).at(-1)?.text ?? '';
}

// ---- Editing -------------------------------------------------------------------

export function getProfileFormValues(contract) {
  return {
    contactName: contract.contactName,
    mobile: contract.mobile,
    email: contract.email,
    address: contract.address,
    product: contract.product,
    assignedTo: contract.assignedTo,
  };
}

export function validateProfile(values) {
  const errors = [];
  if (values.contactName.trim() === '') errors.push('Enter the contact person.');
  if (!MOBILE_PATTERN.test(values.mobile.trim())) errors.push('Enter a 10-digit mobile number.');
  const email = values.email.trim();
  if (email !== '' && !EMAIL_PATTERN.test(email)) errors.push('Enter a valid email address.');
  if (values.address.trim() === '') errors.push('Enter the address.');
  if (values.product.trim() === '') errors.push('Enter the product or service.');
  return errors;
}

export function toProfileChanges(values) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
}

/** An entry for the timeline. Remarks are flagged so the overview can show the latest one. */
export function createActivity(todayIso, text, by, isRemark = false) {
  return { id: crypto.randomUUID(), date: todayIso, text, by, isRemark };
}
