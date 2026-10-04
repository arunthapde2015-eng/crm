import { COMPANY } from '@/constants/company';
import { CASH_MODE } from '@/constants/payments';
import { getNextDocumentNumber } from '@/utils/documentNumber';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDocumentDate, parseIsoDate, toIsoDate } from '@/utils/formatDate';
import { toFileNamePart } from '@/utils/print';
import {
  getMailtoUrl as getMailtoShareUrl,
  getWhatsAppUrl as getWhatsAppShareUrl,
} from '@/utils/share';

import {
  ALL_FILTER_VALUE,
  CASH_ACCOUNT,
  DEFAULT_BANK_ACCOUNT,
  RECEIPT_NUMBER_PREFIX,
  RECEIPT_STATUSES,
} from '../constants';

const { CLEARED, CANCELLED } = RECEIPT_STATUSES;

// ---- Money ---------------------------------------------------------------------

/** Only cleared receipts are money actually collected. */
export function isCollected(receipt) {
  return receipt.status === CLEARED;
}

/** What's still owed on an invoice after its cleared receipts. */
export function getInvoiceBalance(invoice, receipts) {
  const received = receipts
    .filter((receipt) => receipt.invoiceNumber === invoice.number && isCollected(receipt))
    .reduce((sum, receipt) => sum + receipt.amount, 0);
  return invoice.total - received;
}

/** Invoices with money still to collect, oldest number first. */
export function getOpenInvoices(invoices, receipts) {
  return invoices
    .map((invoice) => ({ ...invoice, balance: getInvoiceBalance(invoice, receipts) }))
    .filter((invoice) => invoice.balance > 0)
    .sort((first, second) => first.number.localeCompare(second.number));
}

export function findInvoice(invoices, invoiceNumber) {
  return invoices.find((invoice) => invoice.number === invoiceNumber) ?? null;
}

// ---- Lists ---------------------------------------------------------------------

/** Text and status filters, newest first. */
export function filterReceipts(receipts, invoices, { query, status }) {
  const normalizedQuery = query.trim().toLowerCase();
  return receipts
    .filter((receipt) => {
      const customer = findInvoice(invoices, receipt.invoiceNumber)?.customer ?? '';
      const searchable = [receipt.number, receipt.invoiceNumber, receipt.reference, customer]
        .join(' ')
        .toLowerCase();
      return (
        searchable.includes(normalizedQuery) &&
        (status === ALL_FILTER_VALUE || receipt.status === status)
      );
    })
    .sort(
      (first, second) =>
        second.date.localeCompare(first.date) || second.number.localeCompare(first.number),
    );
}

export function getListSummary(receipts) {
  return {
    count: receipts.length,
    collected: receipts.filter(isCollected).reduce((sum, receipt) => sum + receipt.amount, 0),
  };
}

// ---- Numbering -----------------------------------------------------------------

/** "REC-<FY start year>-<sequence>", counting up within the financial year. */
export function getNextReceiptNumber(receipts, isoDate) {
  return getNextDocumentNumber(
    receipts.map((receipt) => receipt.number),
    RECEIPT_NUMBER_PREFIX,
    isoDate,
  );
}

// ---- Recording -----------------------------------------------------------------

export function getDefaultAccount(mode) {
  return mode === CASH_MODE ? CASH_ACCOUNT : DEFAULT_BANK_ACCOUNT;
}

export function getEmptyFormValues(today, invoiceNumber = '') {
  return {
    invoiceNumber,
    amount: '',
    date: toIsoDate(today),
    mode: 'NEFT',
    reference: '',
    account: DEFAULT_BANK_ACCOUNT,
  };
}

/**
 * Problems with a new receipt, or [] if it can be saved. Money must be against an invoice that
 * still has a balance, and a bank reference (UTR / cheque no.) can only be used once.
 */
export function validateReceipt(values, invoices, receipts) {
  const errors = [];
  const invoice = findInvoice(invoices, values.invoiceNumber);
  const amount = Number(values.amount);
  const reference = values.reference.trim();

  if (!invoice) {
    errors.push('Choose the invoice this payment is for.');
  } else {
    const balance = getInvoiceBalance(invoice, receipts);
    if (!(amount > 0)) errors.push('Enter an amount greater than zero.');
    else if (amount > balance) {
      errors.push(`Amount is more than the invoice balance of ${formatCurrency(balance)}.`);
    }
  }

  if (values.mode !== CASH_MODE && reference === '') {
    errors.push('Enter the UTR, transaction ID or cheque number.');
  }
  const duplicate = receipts.find(
    (receipt) =>
      reference !== '' &&
      receipt.status !== CANCELLED &&
      receipt.reference.toLowerCase() === reference.toLowerCase(),
  );
  if (duplicate) errors.push(`Reference ${reference} is already used on ${duplicate.number}.`);
  return errors;
}

export function createReceipt(values, receipts) {
  const number = getNextReceiptNumber(receipts, values.date);
  return {
    id: number,
    number,
    date: values.date,
    invoiceNumber: values.invoiceNumber,
    mode: values.mode,
    reference: values.reference.trim(),
    account: values.account,
    amount: Number(values.amount),
    status: CLEARED,
    voidReason: '',
    voidDate: null,
  };
}

/** Bounce or cancel a receipt. It stays on record; the invoice balance goes back up. */
export function voidReceipt(receipt, status, reason, date) {
  return { ...receipt, status, voidReason: reason.trim(), voidDate: date };
}

// ---- Sharing -------------------------------------------------------------------

export function getPrintFileName(receipt, customerName) {
  return `Receipt-${receipt.number}-${toFileNamePart(customerName)}`;
}

function getShareMessage(receipt, invoice) {
  return [
    `Dear ${invoice.customer},`,
    '',
    `We have received ${formatCurrency(receipt.amount)} on ${formatDocumentDate(parseIsoDate(receipt.date))} by ${receipt.mode}${receipt.reference ? ` (ref. ${receipt.reference})` : ''} against invoice ${invoice.number}. Receipt no. ${receipt.number}.`,
    '',
    'Thank you.',
    COMPANY.legalName,
    `${COMPANY.mobile} | ${COMPANY.email}`,
  ].join('\n');
}

export function getWhatsAppUrl(receipt, invoice) {
  return getWhatsAppShareUrl(invoice.phone, getShareMessage(receipt, invoice));
}

export function getMailtoUrl(receipt, invoice) {
  const subject = `Payment receipt ${receipt.number} from ${COMPANY.legalName}`;
  return getMailtoShareUrl(invoice.email, subject, getShareMessage(receipt, invoice));
}
