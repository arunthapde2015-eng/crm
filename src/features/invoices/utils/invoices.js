import { COMPANY, COMPANY_STATE } from '@/constants/company';
import { formatCurrency } from '@/utils/formatCurrency';
import { addDays, formatDocumentDate, parseIsoDate, toIsoDate } from '@/utils/formatDate';
import {
  createEmptyLine,
  getTotal,
  parseLineFormValues,
  toLineFormValues,
  validateLines,
} from '@/utils/lineItems';
import { toFileNamePart } from '@/utils/print';
import {
  getMailtoUrl as getMailtoShareUrl,
  getWhatsAppUrl as getWhatsAppShareUrl,
} from '@/utils/share';

import {
  ALL_FILTER_VALUE,
  DEFAULT_DUE_DAYS,
  DEFAULT_TERMS,
  INVOICE_KINDS,
  INVOICE_NUMBER_PREFIXES,
  INVOICE_STATUSES,
  KIND_FILTERS,
  NOTE_NUMBER_PREFIXES,
  NOTE_TYPES,
  NUMBER_DIGITS,
} from '../constants';

const { DRAFT, ISSUED, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED } = INVOICE_STATUSES;

// ---- Money -------------------------------------------------------------------

export function getPaid(invoice) {
  return invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

/** Debit notes add to what's owed; credit notes reduce it. */
export function getNoteAdjustment(invoice) {
  return invoice.notes.reduce(
    (sum, note) => sum + (note.type === NOTE_TYPES.DEBIT ? note.amount : -note.amount),
    0,
  );
}

/** Drafts and cancelled invoices aren't bills: they count toward nothing. */
export function isBilled(invoice) {
  return invoice.status !== DRAFT && invoice.status !== CANCELLED;
}

/** What the customer still owes; zero for drafts and cancelled invoices. */
export function getBalance(invoice) {
  if (!isBilled(invoice)) return 0;
  return Math.max(0, getTotal(invoice) + getNoteAdjustment(invoice) - getPaid(invoice));
}

// ---- Status and rules ----------------------------------------------------------

/** Draft and cancelled are stored; the rest follow from payments and the due date. */
export function getDisplayStatus(invoice, todayIsoDate) {
  if (!isBilled(invoice)) return invoice.status;
  if (getBalance(invoice) === 0) return PAID;
  if (invoice.dueDate < todayIsoDate) return OVERDUE;
  return getPaid(invoice) > 0 ? PARTIALLY_PAID : ISSUED;
}

export function canRecordPayment(invoice) {
  return isBilled(invoice) && getBalance(invoice) > 0;
}

/** Issued tax invoices are corrected with credit/debit notes, never edited. */
export function canEdit(invoice) {
  return invoice.status === DRAFT;
}

/**
 * Why the invoice can't be cancelled, or null if it can. Once money has been received,
 * a credit note is the correct way to reverse it.
 */
export function getCancelBlocker(invoice) {
  if (!isBilled(invoice)) return 'Only issued invoices can be cancelled.';
  if (invoice.payments.length > 0) {
    return 'Payments have been received. Raise a credit note instead.';
  }
  return null;
}

export function getPaymentError(invoice, amount) {
  if (!canRecordPayment(invoice)) return 'This invoice has nothing to collect.';
  if (!(amount > 0)) return 'Enter an amount greater than zero.';
  if (amount > getBalance(invoice)) {
    return `Amount is more than the balance of ${formatCurrency(getBalance(invoice))}.`;
  }
  return null;
}

/** A credit note can't take back more than has been invoiced (including earlier notes). */
export function getNoteError(invoice, type, amount) {
  if (!isBilled(invoice)) return 'Notes can only be raised against issued invoices.';
  if (!(amount > 0)) return 'Enter an amount greater than zero.';
  const creditable = getTotal(invoice) + getNoteAdjustment(invoice);
  if (type === NOTE_TYPES.CREDIT && amount > creditable) {
    return `A credit note can’t exceed ${formatCurrency(creditable)}.`;
  }
  return null;
}

/** Incentives are worked out on the Incentives page; AMC invoices don't count toward them. */
export function getIncentiveNote(invoice, salespersonName) {
  if (invoice.kind === INVOICE_KINDS.AMC) {
    return 'No incentive: AMC invoices aren’t included in this salesperson’s rate.';
  }
  return salespersonName
    ? `Counts toward ${salespersonName}’s incentive, worked out on the Incentives page.`
    : 'No salesperson: this invoice doesn’t count toward any incentive.';
}

// ---- Lists -------------------------------------------------------------------

/** Text, status and kind filters, newest first. */
export function filterInvoices(invoices, { query, status, kind }, todayIsoDate) {
  const normalizedQuery = query.trim().toLowerCase();
  return invoices
    .filter((invoice) => {
      const searchable = [
        invoice.number,
        invoice.customer.name,
        invoice.customer.gstin,
        ...invoice.items.map((item) => item.product),
      ]
        .join(' ')
        .toLowerCase();
      return (
        searchable.includes(normalizedQuery) &&
        (status === ALL_FILTER_VALUE || getDisplayStatus(invoice, todayIsoDate) === status) &&
        (kind === KIND_FILTERS.ALL || invoice.kind === kind)
      );
    })
    .sort(
      (first, second) =>
        second.date.localeCompare(first.date) || second.number.localeCompare(first.number),
    );
}

/** Count of every listed invoice; billed and outstanding only from real (issued) bills. */
export function getListSummary(invoices) {
  const billed = invoices.filter(isBilled);
  return {
    count: invoices.length,
    billed: billed.reduce((sum, invoice) => sum + getTotal(invoice), 0),
    outstanding: billed.reduce((sum, invoice) => sum + getBalance(invoice), 0),
  };
}

// ---- Sharing -------------------------------------------------------------------

export function getDocumentTitle(invoice) {
  return invoice.kind === INVOICE_KINDS.AMC ? 'Tax Invoice (AMC)' : 'Tax Invoice';
}

export function getPrintFileName(invoice) {
  return `Invoice-${invoice.number}-${toFileNamePart(invoice.customer.name)}`;
}

function getShareMessage(invoice) {
  const balance = getBalance(invoice);
  return [
    `Dear ${invoice.customer.name},`,
    '',
    `Please find our invoice ${invoice.number} dated ${formatDocumentDate(parseIsoDate(invoice.date))} for ${formatCurrency(getTotal(invoice))}.`,
    balance > 0
      ? `Balance due: ${formatCurrency(balance)} by ${formatDocumentDate(parseIsoDate(invoice.dueDate))}.`
      : 'This invoice is fully paid. Thank you.',
    '',
    'Regards,',
    COMPANY.legalName,
    `${COMPANY.mobile} | ${COMPANY.email}`,
  ].join('\n');
}

export function getWhatsAppUrl(invoice) {
  return getWhatsAppShareUrl(invoice.customer.phone, getShareMessage(invoice));
}

export function getMailtoUrl(invoice) {
  const subject = `Invoice ${invoice.number} from ${COMPANY.legalName}`;
  return getMailtoShareUrl(invoice.customer.email, subject, getShareMessage(invoice));
}

// ---- Numbering -------------------------------------------------------------------

function getNextNumber(numbers, prefix, year) {
  const yearPrefix = `${prefix}-${year}-`;
  const highest = numbers
    .filter((number) => number.startsWith(yearPrefix))
    .reduce((max, number) => Math.max(max, Number(number.slice(yearPrefix.length))), 0);
  return `${yearPrefix}${String(highest + 1).padStart(NUMBER_DIGITS, '0')}`;
}

/** Sales (INV-) and AMC (AMC-) invoices are numbered in separate series. */
function getNextInvoiceNumber(invoices, kind, year) {
  return getNextNumber(
    invoices.map((invoice) => invoice.number),
    INVOICE_NUMBER_PREFIXES[kind],
    year,
  );
}

// ---- Creating and changing -------------------------------------------------------

export function getEmptyFormValues(today) {
  return {
    kind: INVOICE_KINDS.SALES,
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: '',
    customerGstin: '',
    placeOfSupply: COMPANY_STATE,
    salespersonId: '',
    date: toIsoDate(today),
    dueDate: toIsoDate(addDays(today, DEFAULT_DUE_DAYS)),
    items: [createEmptyLine()],
    terms: DEFAULT_TERMS,
  };
}

export function toFormValues(invoice) {
  return {
    kind: invoice.kind,
    customerName: invoice.customer.name,
    customerAddress: invoice.customer.address,
    customerPhone: invoice.customer.phone,
    customerEmail: invoice.customer.email,
    customerGstin: invoice.customer.gstin,
    placeOfSupply: invoice.placeOfSupply,
    salespersonId: invoice.salespersonId ?? '',
    date: invoice.date,
    dueDate: invoice.dueDate,
    items: toLineFormValues(invoice.items),
    terms: invoice.terms,
  };
}

export function parseFormValues(values) {
  return {
    kind: values.kind,
    customer: {
      name: values.customerName.trim(),
      address: values.customerAddress.trim(),
      phone: values.customerPhone.trim(),
      email: values.customerEmail.trim(),
      gstin: values.customerGstin.trim().toUpperCase(),
    },
    placeOfSupply: values.placeOfSupply,
    salespersonId: values.salespersonId || null,
    date: values.date,
    dueDate: values.dueDate,
    items: parseLineFormValues(values.items),
    discountPercent: 0,
    terms: values.terms.trim(),
  };
}

export function validateFormValues(values) {
  const parsed = parseFormValues(values);
  const errors = [...validateLines(parsed.items)];
  if (parsed.dueDate < parsed.date) errors.push('Due date must be on or after the invoice date.');
  return errors;
}

/** @param {boolean} shouldIssue - Issue now, or keep as a draft to finish later. */
export function createInvoice(values, existing, shouldIssue) {
  const fields = parseFormValues(values);
  const number = getNextInvoiceNumber(existing, fields.kind, fields.date.slice(0, 4));
  return {
    id: number,
    number,
    ...fields,
    status: shouldIssue ? ISSUED : DRAFT,
    payments: [],
    notes: [],
  };
}

/**
 * Saves edits to a draft. Changing between sales and AMC moves it to the other number series.
 */
export function updateDraft(invoice, values, allInvoices) {
  const fields = parseFormValues(values);
  if (fields.kind === invoice.kind) return { ...invoice, ...fields };
  const others = allInvoices.filter((item) => item.id !== invoice.id);
  const number = getNextInvoiceNumber(others, fields.kind, fields.date.slice(0, 4));
  return { ...invoice, ...fields, number };
}

export function duplicateInvoice(invoice, existing, today) {
  const date = toIsoDate(today);
  const number = getNextInvoiceNumber(existing, invoice.kind, date.slice(0, 4));
  return {
    ...invoice,
    id: number,
    number,
    date,
    dueDate: toIsoDate(addDays(today, DEFAULT_DUE_DAYS)),
    items: invoice.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
    status: DRAFT,
    payments: [],
    notes: [],
  };
}

export function createPayment(values) {
  return {
    id: crypto.randomUUID(),
    date: values.date,
    amount: Number(values.amount),
    mode: values.mode,
    reference: values.reference.trim(),
  };
}

/** Credit (CN-) and debit (DN-) notes are numbered across all invoices. */
export function createNote(values, allInvoices) {
  const existingNumbers = allInvoices.flatMap((invoice) =>
    invoice.notes.map((note) => note.number),
  );
  return {
    id: crypto.randomUUID(),
    number: getNextNumber(
      existingNumbers,
      NOTE_NUMBER_PREFIXES[values.type],
      values.date.slice(0, 4),
    ),
    type: values.type,
    date: values.date,
    amount: Number(values.amount),
    reason: values.reason.trim(),
  };
}
