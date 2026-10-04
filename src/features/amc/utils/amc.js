import { getDaysBetween } from '@/utils/dateRange';
import { getNextDocumentNumber } from '@/utils/documentNumber';
import { addDays, formatDayMonthYear, parseIsoDate, toIsoDate } from '@/utils/formatDate';
import { DEFAULT_GST_RATE } from '@/utils/lineItems';

import {
  ALL_FILTER_VALUE,
  AMC_INVOICE_PREFIX,
  AMC_STATUSES,
  AMC_TERM_MONTHS,
  EXPIRING_SOON_DAYS,
  REMINDER_DAYS,
  UNRECORDED_PAYMENT_MODE,
} from '../constants';

const PERCENT = 100;

// ---- Dates ---------------------------------------------------------------------

/** Last day of an AMC year that starts on `startIsoDate`: 12-10-2026 → 11-10-2027. */
export function getPeriodEnd(startIsoDate) {
  const start = parseIsoDate(startIsoDate);
  return toIsoDate(
    new Date(start.getFullYear(), start.getMonth() + AMC_TERM_MONTHS, start.getDate() - 1),
  );
}

// ---- One contract --------------------------------------------------------------

/** The AMC year running today; the latest one that has started, or the first if none has. */
export function getCurrentPeriod(contract, todayIso) {
  const started = contract.periods.filter((period) => period.start <= todayIso);
  return started.at(-1) ?? contract.periods[0];
}

/** The next AMC year, already invoiced but not started yet. */
export function getRenewalPeriod(contract, todayIso) {
  const current = getCurrentPeriod(contract, todayIso);
  return contract.periods.find((period) => period.start > current.end) ?? null;
}

export function getDaysRemaining(contract, todayIso) {
  return getDaysBetween(todayIso, getCurrentPeriod(contract, todayIso).end);
}

export function getStatus(contract, todayIso) {
  const [firstPeriod] = contract.periods;
  if (contract.periods.length === 1 && !firstPeriod.isPaid) {
    return AMC_STATUSES.PENDING_FIRST_PAYMENT;
  }
  if (getRenewalPeriod(contract, todayIso)?.isPaid) return AMC_STATUSES.RENEWED;

  const daysRemaining = getDaysRemaining(contract, todayIso);
  if (daysRemaining < 0) return AMC_STATUSES.EXPIRED;
  if (daysRemaining <= EXPIRING_SOON_DAYS) return AMC_STATUSES.EXPIRING_SOON;
  return AMC_STATUSES.ACTIVE;
}

/** The latest reminder already sent, e.g. "15-day reminder" with 8 days left. */
export function getReminderLabel(contract, todayIso) {
  const status = getStatus(contract, todayIso);
  // Paid-up and brand-new contracts have nothing to chase.
  if (status === AMC_STATUSES.RENEWED || status === AMC_STATUSES.PENDING_FIRST_PAYMENT) return '';

  const daysRemaining = getDaysRemaining(contract, todayIso);
  if (daysRemaining < 0) {
    const daysAgo = -daysRemaining;
    return `Expired ${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
  }
  const sent = REMINDER_DAYS.filter((days) => days >= daysRemaining).at(-1);
  if (sent === undefined) return '';
  return sent === 0 ? 'Expiry-day reminder' : `${sent}-day reminder`;
}

export function getUnpaidPeriod(contract) {
  return contract.periods.find((period) => !period.isPaid) ?? null;
}

/**
 * The renewal for the Renewal column: the next year if it's invoiced, or a back-dated renewal
 * (one that has already started) while it is unpaid.
 */
export function getRenewalToShow(contract, todayIso) {
  const upcoming = getRenewalPeriod(contract, todayIso);
  if (upcoming) return upcoming;
  const unpaid = getUnpaidPeriod(contract);
  return unpaid && unpaid !== contract.periods[0] ? unpaid : null;
}

/** A renewal can be raised once per year, and not while one is waiting. */
export function canRenew(contract, todayIso) {
  return getRenewalPeriod(contract, todayIso) === null && getUnpaidPeriod(contract) === null;
}

// ---- Lists ---------------------------------------------------------------------

/** Text and status filters, soonest expiry first. */
export function filterContracts(contracts, todayIso, { query, status }) {
  const normalizedQuery = query.trim().toLowerCase();
  return contracts
    .filter((contract) => {
      const searchable = [
        contract.merchantName,
        contract.merchantCode,
        ...contract.periods.map((p) => p.invoiceNumber),
      ]
        .join(' ')
        .toLowerCase();
      return (
        searchable.includes(normalizedQuery) &&
        (status === ALL_FILTER_VALUE || getStatus(contract, todayIso) === status)
      );
    })
    .sort(
      (first, second) => getDaysRemaining(first, todayIso) - getDaysRemaining(second, todayIso),
    );
}

/** What the merchant pays for an AMC year: the amount plus GST. */
export function withGst(amount) {
  return Math.round((amount * (PERCENT + DEFAULT_GST_RATE)) / PERCENT);
}

/**
 * Status counts plus money. Revenue is the taxable AMC value billed; dues include GST, as that
 * is what the merchant has to pay.
 */
export function getSummary(contracts, todayIso) {
  const counts = Object.fromEntries(Object.values(AMC_STATUSES).map((status) => [status, 0]));
  contracts.forEach((contract) => {
    counts[getStatus(contract, todayIso)] += 1;
  });
  const periods = contracts.flatMap((contract) => contract.periods);
  return {
    counts,
    billed: periods.reduce((sum, period) => sum + period.amount, 0),
    dues: periods
      .filter((period) => !period.isPaid)
      .reduce((sum, period) => sum + withGst(period.amount), 0),
  };
}

// ---- Renewing ------------------------------------------------------------------

/** "AMC-<FY start year>-<sequence>", counting up within the financial year of `todayIso`. */
export function getNextInvoiceNumber(contracts, todayIso) {
  const numbers = contracts.flatMap((contract) =>
    contract.periods.map((period) => period.invoiceNumber),
  );
  return getNextDocumentNumber(numbers, AMC_INVOICE_PREFIX, todayIso);
}

/** Same amount, starting the day after the current year ends so there's no gap or overlap. */
export function getRenewalFormValues(contract, todayIso) {
  const current = getCurrentPeriod(contract, todayIso);
  return {
    amount: String(current.amount),
    start: toIsoDate(addDays(parseIsoDate(current.end), 1)),
  };
}

export function validateRenewal(values, contract, todayIso) {
  const errors = [];
  const current = getCurrentPeriod(contract, todayIso);
  if (!(Number(values.amount) > 0)) errors.push('Enter an amount greater than zero.');
  if (values.start === '') errors.push('Choose the date the renewal starts.');
  else if (values.start <= current.end) {
    errors.push(
      `The renewal must start after the current AMC ends on ${formatDayMonthYear(parseIsoDate(current.end))}.`,
    );
  }
  return errors;
}

/** The renewal is invoiced now and stays pending until it is paid. */
export function createRenewalPeriod(values, contracts, todayIso) {
  return {
    invoiceNumber: getNextInvoiceNumber(contracts, todayIso),
    invoiceDate: todayIso,
    start: values.start,
    end: getPeriodEnd(values.start),
    amount: Number(values.amount),
    isPaid: false,
  };
}

/** The payment logged when an AMC invoice is marked paid here, for the full amount with GST. */
export function createMarkedPayment(period, todayIso) {
  return {
    date: todayIso,
    invoiceNumber: period.invoiceNumber,
    mode: UNRECORDED_PAYMENT_MODE,
    reference: '',
    amount: withGst(period.amount),
  };
}
