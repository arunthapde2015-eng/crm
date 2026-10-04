import { getNextDocumentNumber } from '@/utils/documentNumber';
import { toIsoDate } from '@/utils/formatDate';
import { DEFAULT_GST_RATE } from '@/utils/lineItems';

import {
  ALL_FILTER_VALUE,
  EXPENSE_CATEGORIES,
  EXPENSE_NUMBER_PREFIX,
  EXPENSE_STATUSES,
} from '../constants';

const PERCENT = 100;
const { PENDING, APPROVED, REJECTED } = EXPENSE_STATUSES;

export function getGstAmount(amount, gstRate) {
  return Math.round((amount * gstRate) / PERCENT);
}

/** Rejected expenses stay listed but aren't money spent. */
export function isCounted(expense) {
  return expense.status !== REJECTED;
}

// ---- Lists ---------------------------------------------------------------------

/** Text and status filters, newest first. */
export function filterExpenses(expenses, { query, status }) {
  const normalizedQuery = query.trim().toLowerCase();
  return expenses
    .filter((expense) => {
      const searchable = [
        expense.number,
        expense.category,
        expense.vendor,
        expense.description,
        expense.reference,
      ]
        .join(' ')
        .toLowerCase();
      return (
        searchable.includes(normalizedQuery) &&
        (status === ALL_FILTER_VALUE || expense.status === status)
      );
    })
    .sort(
      (first, second) =>
        second.date.localeCompare(first.date) || second.number.localeCompare(first.number),
    );
}

export function getListSummary(expenses) {
  return {
    count: expenses.length,
    total: expenses.filter(isCounted).reduce((sum, expense) => sum + expense.amount, 0),
    pendingCount: expenses.filter((expense) => expense.status === PENDING).length,
  };
}

// ---- Recording -----------------------------------------------------------------

export function getEmptyFormValues(today) {
  return {
    date: toIsoDate(today),
    category: EXPENSE_CATEGORIES[0],
    vendor: '',
    description: '',
    amount: '',
    gstRate: String(DEFAULT_GST_RATE),
    mode: 'NEFT',
    reference: '',
  };
}

function findDuplicate(values, expenses) {
  const vendor = values.vendor.trim().toLowerCase();
  return expenses.find(
    (expense) =>
      isCounted(expense) &&
      expense.vendor.toLowerCase() === vendor &&
      expense.date === values.date &&
      expense.amount === Number(values.amount),
  );
}

/**
 * Problems with a new expense, or [] if it can be saved. The same bill can't be entered twice:
 * neither the same vendor, date and amount, nor a payment reference already used.
 */
export function validateExpense(values, expenses, todayIso) {
  const errors = [];
  const reference = values.reference.trim();

  if (values.date === '') errors.push('Enter the expense date.');
  else if (values.date > todayIso) errors.push("The expense date can't be in the future.");
  if (values.vendor.trim() === '') errors.push('Enter the vendor.');
  if (!(Number(values.amount) > 0)) errors.push('Enter an amount greater than zero.');

  const duplicate = findDuplicate(values, expenses);
  if (duplicate) {
    errors.push(`This looks like ${duplicate.number}: same vendor, date and amount.`);
  }
  const reusedReference = expenses.find(
    (expense) =>
      reference !== '' &&
      isCounted(expense) &&
      expense.reference.toLowerCase() === reference.toLowerCase(),
  );
  if (reusedReference) {
    errors.push(`Reference ${reference} is already used on ${reusedReference.number}.`);
  }
  return errors;
}

/** New expenses wait for approval. A blank description falls back to the category. */
export function createExpense(values, expenses, submittedBy) {
  const number = getNextDocumentNumber(
    expenses.map((expense) => expense.number),
    EXPENSE_NUMBER_PREFIX,
    values.date,
  );
  return {
    id: number,
    number,
    date: values.date,
    category: values.category,
    vendor: values.vendor.trim(),
    description: values.description.trim() || values.category,
    mode: values.mode,
    reference: values.reference.trim(),
    amount: Number(values.amount),
    gstRate: Number(values.gstRate),
    status: PENDING,
    submittedBy,
    approvedBy: '',
    rejectReason: '',
  };
}

export function approveExpense(expense, approver) {
  return { ...expense, status: APPROVED, approvedBy: approver };
}

export function rejectExpense(expense, approver, reason) {
  return { ...expense, status: REJECTED, approvedBy: approver, rejectReason: reason.trim() };
}
