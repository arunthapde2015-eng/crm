import { COMPANY_STATE } from '@/constants/company';
import { addDays, toIsoDate } from '@/utils/formatDate';
import {
  createEmptyLine,
  getTotal,
  parseLineFormValues,
  toLineFormValues,
  validateLines,
} from '@/utils/lineItems';
import { toFileNamePart } from '@/utils/print';

import {
  ALL_FILTER_VALUE,
  APPROVAL_DISCOUNT_PERCENT,
  APPROVAL_STATUSES,
  DEFAULT_TERMS,
  DEFAULT_VALIDITY_DAYS,
  PERCENT,
  QUOTATION_NUMBER_DIGITS,
  QUOTATION_NUMBER_PREFIX,
  QUOTATION_STATUSES,
} from '../constants';

const { DRAFT, SENT, ACCEPTED, CONVERTED, EXPIRED } = QUOTATION_STATUSES;

// ---- Money ----------------------------------------------------------------
// Shared with other billing documents; re-exported so quotation code has one import.
export {
  getDiscountAmount,
  getGross,
  getGst,
  getGstRateLabel,
  getGstSplit,
  getLineTaxable,
  getTaxable,
  getTotal,
} from '@/utils/lineItems';

/** The products named in the covering letter: "Product A, Product B". */
export function getProposalSubject(quotation) {
  return quotation.items.map((item) => item.product).join(', ');
}

/**
 * Name the browser suggests when saving the printout as PDF, e.g.
 * "Quotation-QTN-2026-0007-SWARJY-URBAN-CO-OP-CREDIT-SOCIETY-LI-PAT".
 */
export function getPrintFileName(quotation) {
  return `Quotation-${quotation.number}-${toFileNamePart(quotation.customer)}`;
}

// ---- Status and rules ------------------------------------------------------

/** Stored status, except sent quotations past their validity show as expired. */
export function getDisplayStatus(quotation, todayIsoDate) {
  if (quotation.status === SENT && quotation.validUntil < todayIsoDate) return EXPIRED;
  return quotation.status;
}

export function getApprovalFor(discountPercent) {
  return discountPercent >= APPROVAL_DISCOUNT_PERCENT
    ? APPROVAL_STATUSES.PENDING
    : APPROVAL_STATUSES.NOT_NEEDED;
}

/** Converted quotations are final; everything else can be edited (or revised). */
export function canEdit(quotation) {
  return quotation.status !== CONVERTED;
}

/** Editing anything already shared with the customer creates a new revision. */
export function isRevisionEdit(quotation) {
  return quotation.status !== DRAFT;
}

/**
 * Why a draft can't be sent yet, or null if it can. Discounts that need approval must be
 * approved first.
 */
export function getSendBlocker(quotation) {
  if (quotation.status !== DRAFT) return 'Only drafts can be sent.';
  if (quotation.approval === APPROVAL_STATUSES.PENDING) {
    return `Discounts of ${APPROVAL_DISCOUNT_PERCENT}% or more need approval before sending.`;
  }
  if (quotation.approval === APPROVAL_STATUSES.REJECTED) {
    return 'The discount was not approved. Edit the quotation to change it.';
  }
  return null;
}

/** The customer-response and conversion actions available for a quotation today. */
export function getAvailableActions(quotation, todayIsoDate) {
  const status = getDisplayStatus(quotation, todayIsoDate);
  return {
    canSend: quotation.status === DRAFT,
    canDecideApproval: quotation.approval === APPROVAL_STATUSES.PENDING,
    canRecordResponse: status === SENT,
    canConvert: status === ACCEPTED,
  };
}

// ---- Lists -----------------------------------------------------------------

/** Text and status filters, newest first (same day: lower number first). */
export function filterQuotations(quotations, { query, status }, todayIsoDate) {
  const normalizedQuery = query.trim().toLowerCase();
  return quotations
    .filter((quotation) => {
      const searchable = [
        quotation.number,
        quotation.customer,
        ...quotation.items.map((i) => i.product),
      ]
        .join(' ')
        .toLowerCase();
      return (
        searchable.includes(normalizedQuery) &&
        (status === ALL_FILTER_VALUE || getDisplayStatus(quotation, todayIsoDate) === status)
      );
    })
    .sort(
      (first, second) =>
        second.date.localeCompare(first.date) || first.number.localeCompare(second.number),
    );
}

/** Count and grand total for the list header; the caller formats them. */
export function getListSummary(quotations) {
  return {
    count: quotations.length,
    total: quotations.reduce((sum, quotation) => sum + getTotal(quotation), 0),
  };
}

// ---- Creating and changing -------------------------------------------------

export function getEmptyFormValues(today) {
  const date = toIsoDate(today);
  return {
    customer: '',
    salespersonId: '',
    date,
    validUntil: toIsoDate(addDays(today, DEFAULT_VALIDITY_DAYS)),
    placeOfSupply: COMPANY_STATE,
    items: [createEmptyLine()],
    discountPercent: '0',
    sections: [],
    terms: DEFAULT_TERMS,
  };
}

/** Sections are edited as a title plus one point per line of text. */
export function createEmptySection() {
  return { id: crypto.randomUUID(), title: '', pointsText: '' };
}

export function toFormValues(quotation) {
  return {
    customer: quotation.customer,
    salespersonId: quotation.salespersonId ?? '',
    date: quotation.date,
    validUntil: quotation.validUntil,
    placeOfSupply: quotation.placeOfSupply,
    items: toLineFormValues(quotation.items),
    discountPercent: String(quotation.discountPercent),
    sections: quotation.sections.map((section) => ({
      id: section.id,
      title: section.title,
      pointsText: section.points.join('\n'),
    })),
    terms: quotation.terms,
  };
}

function parseSections(sections) {
  return sections
    .map((section) => ({
      id: section.id,
      title: section.title.trim(),
      points: section.pointsText
        .split('\n')
        .map((point) => point.trim())
        .filter(Boolean),
    }))
    .filter((section) => section.title !== '' || section.points.length > 0);
}

/** Form values (strings) → quotation fields (numbers), dropping blank lines and sections. */
export function parseFormValues(values) {
  const discountPercent = Number(values.discountPercent) || 0;
  return {
    customer: values.customer.trim(),
    salespersonId: values.salespersonId || null,
    date: values.date,
    validUntil: values.validUntil,
    placeOfSupply: values.placeOfSupply,
    items: parseLineFormValues(values.items),
    discountPercent,
    sections: parseSections(values.sections),
    terms: values.terms.trim(),
    approval: getApprovalFor(discountPercent),
  };
}

/** Problems with form values, or [] if they can be saved. */
export function validateFormValues(values) {
  const parsed = parseFormValues(values);
  const errors = [...validateLines(parsed.items)];
  if (parsed.discountPercent < 0 || parsed.discountPercent > PERCENT) {
    errors.push('Discount must be between 0 and 100%.');
  }
  if (parsed.validUntil < parsed.date) errors.push('Valid until must be on or after the date.');
  if (parsed.sections.some((section) => section.title === '')) {
    errors.push('Each extra section needs a heading.');
  }
  return errors;
}

function getNextNumber(quotations, year) {
  const yearPrefix = `${QUOTATION_NUMBER_PREFIX}-${year}-`;
  const highest = quotations
    .filter((quotation) => quotation.number.startsWith(yearPrefix))
    .reduce(
      (max, quotation) => Math.max(max, Number(quotation.number.slice(yearPrefix.length))),
      0,
    );
  return `${yearPrefix}${String(highest + 1).padStart(QUOTATION_NUMBER_DIGITS, '0')}`;
}

export function createQuotation(values, existing) {
  const fields = parseFormValues(values);
  const number = getNextNumber(existing, fields.date.slice(0, 4));
  return { id: number, number, ...fields, status: DRAFT, revision: 1 };
}

/**
 * Saves edits. A draft is changed in place; a quotation the customer has already seen gets the
 * next revision number and goes back to draft so the new version is re-sent.
 */
export function reviseQuotation(quotation, values) {
  const fields = parseFormValues(values);
  if (!isRevisionEdit(quotation)) return { ...quotation, ...fields };
  return { ...quotation, ...fields, status: DRAFT, revision: quotation.revision + 1 };
}

/** A fresh draft copy dated today, with a new number and validity. */
export function duplicateQuotation(quotation, existing, today) {
  const date = toIsoDate(today);
  const number = getNextNumber(existing, date.slice(0, 4));
  return {
    ...quotation,
    id: number,
    number,
    date,
    validUntil: toIsoDate(addDays(today, DEFAULT_VALIDITY_DAYS)),
    items: quotation.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
    status: DRAFT,
    revision: 1,
    approval: getApprovalFor(quotation.discountPercent),
  };
}
