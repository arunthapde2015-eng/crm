import { getNextDocumentNumber } from '@/utils/documentNumber';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate, toIsoDate } from '@/utils/formatDate';

import {
  ALL_FILTER_VALUE,
  BOOKS_START_DATE,
  MIN_VOUCHER_LINES,
  VOUCHER_STATUSES,
  VOUCHER_TYPES,
  VOUCHER_TYPE_DETAILS,
} from '../constants';
import { findAccount } from './accounts';

const { RECEIPT, PAYMENT, CONTRA } = VOUCHER_TYPES;

export function getVoucherTotal(voucher) {
  return voucher.lines.reduce((sum, line) => sum + line.debit, 0);
}

export function getAccountNames(voucher, accounts) {
  return voucher.lines.map(
    (line) => findAccount(accounts, line.accountCode)?.name ?? line.accountCode,
  );
}

/** Text and type filters, newest first. */
export function filterVouchers(vouchers, accounts, { query, type }) {
  const normalizedQuery = query.trim().toLowerCase();
  return vouchers
    .filter((voucher) => {
      const searchable = [
        voucher.number,
        voucher.narration,
        voucher.reference,
        ...getAccountNames(voucher, accounts),
      ]
        .join(' ')
        .toLowerCase();
      return (
        searchable.includes(normalizedQuery) && (type === ALL_FILTER_VALUE || voucher.type === type)
      );
    })
    .sort(
      (first, second) =>
        second.date.localeCompare(first.date) || second.number.localeCompare(first.number),
    );
}

// ---- Entering ------------------------------------------------------------------

export function createEmptyLine() {
  return { id: crypto.randomUUID(), accountCode: '', debit: '', credit: '' };
}

export function getEmptyVoucherValues(today, type = PAYMENT) {
  return {
    type,
    date: toIsoDate(today),
    narration: '',
    reference: '',
    lines: Array.from({ length: MIN_VOUCHER_LINES }, createEmptyLine),
  };
}

function isLineStarted(line) {
  return line.accountCode !== '' || line.debit !== '' || line.credit !== '';
}

/** Lines the user has started, with amounts as numbers. */
function parseLines(lines) {
  return lines.filter(isLineStarted).map((line) => ({
    accountCode: line.accountCode,
    debit: Number(line.debit) || 0,
    credit: Number(line.credit) || 0,
  }));
}

export function getLineTotals(lines) {
  return parseLines(lines).reduce(
    (totals, line) => ({ debit: totals.debit + line.debit, credit: totals.credit + line.credit }),
    { debit: 0, credit: 0 },
  );
}

function validateLines(parsedLines, accounts) {
  const errors = [];
  if (parsedLines.length < MIN_VOUCHER_LINES) errors.push('Enter at least two lines.');
  parsedLines.forEach((line, index) => {
    const label = `Line ${index + 1}`;
    const account = findAccount(accounts, line.accountCode);
    if (!account) errors.push(`${label}: choose an account.`);
    else if (account.isActive === false) errors.push(`${label}: ${account.name} is closed.`);
    const hasDebit = line.debit > 0;
    const hasCredit = line.credit > 0;
    if (hasDebit === hasCredit || line.debit < 0 || line.credit < 0) {
      errors.push(`${label}: enter either a debit or a credit.`);
    }
  });
  return errors;
}

/** Receipts must bring money in, payments take it out, contras only move it between accounts. */
function validateType(type, parsedLines, accounts) {
  const isMoney = (line) => findAccount(accounts, line.accountCode)?.isMoney === true;
  if (type === CONTRA && !parsedLines.every(isMoney)) {
    return ['A contra voucher can only move money between bank and cash accounts.'];
  }
  if (type === RECEIPT && !parsedLines.some((line) => isMoney(line) && line.debit > 0)) {
    return ['A receipt must debit the bank or cash account the money went into.'];
  }
  if (type === PAYMENT && !parsedLines.some((line) => isMoney(line) && line.credit > 0)) {
    return ['A payment must credit the bank or cash account the money came from.'];
  }
  return [];
}

/** Problems with a new voucher, or [] if it can be posted. Debits must equal credits. */
export function validateVoucher(values, accounts, todayIso) {
  const errors = [];
  const parsedLines = parseLines(values.lines);
  const totals = getLineTotals(values.lines);

  if (values.date === '') errors.push('Enter the voucher date.');
  else if (values.date < BOOKS_START_DATE) {
    errors.push(`The books start on ${formatDayMonthYear(parseIsoDate(BOOKS_START_DATE))}.`);
  } else if (values.date > todayIso) errors.push("The voucher date can't be in the future.");
  if (values.narration.trim() === '') errors.push('Enter a narration.');

  errors.push(...validateLines(parsedLines, accounts));
  if (totals.debit !== totals.credit) {
    errors.push(
      `Debits ${formatCurrency(totals.debit)} and credits ${formatCurrency(totals.credit)} don't match.`,
    );
  }
  if (errors.length === 0) errors.push(...validateType(values.type, parsedLines, accounts));
  return errors;
}

export function createVoucher(values, vouchers) {
  const number = getNextDocumentNumber(
    vouchers.map((voucher) => voucher.number),
    VOUCHER_TYPE_DETAILS[values.type].prefix,
    values.date,
  );
  return {
    id: number,
    number,
    type: values.type,
    date: values.date,
    narration: values.narration.trim(),
    reference: values.reference.trim(),
    lines: parseLines(values.lines),
    status: VOUCHER_STATUSES.POSTED,
    cancelReason: '',
  };
}

/** Vouchers are never deleted: a cancelled one stays listed with the reason. */
export function cancelVoucher(voucher, reason) {
  return { ...voucher, status: VOUCHER_STATUSES.CANCELLED, cancelReason: reason.trim() };
}
