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
  DEFAULT_TERMS,
  DEFAULT_VALIDITY_DAYS,
  PROFORMA_NUMBER_DIGITS,
  PROFORMA_NUMBER_PREFIX,
  PROFORMA_STATUSES,
} from '../constants';

const { ISSUED, EXPIRED } = PROFORMA_STATUSES;

// ---- Status and rules ------------------------------------------------------

/** Stored status, except issued proformas past their validity show as expired. */
export function getDisplayStatus(proforma, todayIsoDate) {
  if (proforma.status === ISSUED && proforma.validTill < todayIsoDate) return EXPIRED;
  return proforma.status;
}

/** Converted and cancelled proformas are final records. */
export function isOpen(proforma) {
  return proforma.status === ISSUED;
}

/** Only a live, in-date proforma can become an invoice; an expired one must be re-issued. */
export function canConvert(proforma, todayIsoDate) {
  return getDisplayStatus(proforma, todayIsoDate) === ISSUED;
}

// ---- Lists -----------------------------------------------------------------

/** Text and status filters, newest first (same day: lower number first). */
export function filterProformas(proformas, { query, status }, todayIsoDate) {
  const normalizedQuery = query.trim().toLowerCase();
  return proformas
    .filter((proforma) => {
      const searchable = [
        proforma.number,
        proforma.customer.name,
        proforma.quotationRef,
        ...proforma.items.map((item) => item.product),
      ]
        .join(' ')
        .toLowerCase();
      return (
        searchable.includes(normalizedQuery) &&
        (status === ALL_FILTER_VALUE || getDisplayStatus(proforma, todayIsoDate) === status)
      );
    })
    .sort(
      (first, second) =>
        second.date.localeCompare(first.date) || first.number.localeCompare(second.number),
    );
}

export function getListSummary(proformas) {
  return {
    count: proformas.length,
    total: proformas.reduce((sum, proforma) => sum + getTotal(proforma), 0),
  };
}

// ---- Document details --------------------------------------------------------

export { getPanFromGstin } from '@/utils/gstin';

export function getPrintFileName(proforma) {
  return `Proforma-${proforma.number}-${toFileNamePart(proforma.customer.name)}`;
}

function getShareMessage(proforma) {
  return [
    `Dear ${proforma.customer.name},`,
    '',
    `Please find our proforma invoice ${proforma.number} dated ${formatDocumentDate(parseIsoDate(proforma.date))} for ${formatCurrency(getTotal(proforma))}, valid till ${formatDocumentDate(parseIsoDate(proforma.validTill))}.`,
    '',
    'Regards,',
    COMPANY.legalName,
    `${COMPANY.mobile} | ${COMPANY.email}`,
  ].join('\n');
}

/** WhatsApp chat with the customer, message pre-filled; null without a 10-digit mobile. */
export function getWhatsAppUrl(proforma) {
  return getWhatsAppShareUrl(proforma.customer.phone, getShareMessage(proforma));
}

/** New email to the customer (or a blank recipient), subject and message pre-filled. */
export function getMailtoUrl(proforma) {
  const subject = `Proforma invoice ${proforma.number} from ${COMPANY.legalName}`;
  return getMailtoShareUrl(proforma.customer.email, subject, getShareMessage(proforma));
}

// ---- Creating and changing -------------------------------------------------

export function getEmptyFormValues(today) {
  return {
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: '',
    customerGstin: '',
    placeOfSupply: COMPANY_STATE,
    salespersonId: '',
    date: toIsoDate(today),
    validTill: toIsoDate(addDays(today, DEFAULT_VALIDITY_DAYS)),
    quotationRef: '',
    items: [createEmptyLine()],
    terms: DEFAULT_TERMS,
  };
}

export function toFormValues(proforma) {
  return {
    customerName: proforma.customer.name,
    customerAddress: proforma.customer.address,
    customerPhone: proforma.customer.phone,
    customerEmail: proforma.customer.email,
    customerGstin: proforma.customer.gstin,
    placeOfSupply: proforma.placeOfSupply,
    salespersonId: proforma.salespersonId ?? '',
    date: proforma.date,
    validTill: proforma.validTill,
    quotationRef: proforma.quotationRef,
    items: toLineFormValues(proforma.items),
    terms: proforma.terms,
  };
}

export function parseFormValues(values) {
  return {
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
    validTill: values.validTill,
    quotationRef: values.quotationRef.trim(),
    items: parseLineFormValues(values.items),
    discountPercent: 0,
    terms: values.terms.trim(),
  };
}

export function validateFormValues(values) {
  const parsed = parseFormValues(values);
  const errors = [...validateLines(parsed.items)];
  if (parsed.validTill < parsed.date) errors.push('Valid till must be on or after the date.');
  return errors;
}

function getNextNumber(proformas, year) {
  const yearPrefix = `${PROFORMA_NUMBER_PREFIX}-${year}-`;
  const highest = proformas
    .filter((proforma) => proforma.number.startsWith(yearPrefix))
    .reduce((max, proforma) => Math.max(max, Number(proforma.number.slice(yearPrefix.length))), 0);
  return `${yearPrefix}${String(highest + 1).padStart(PROFORMA_NUMBER_DIGITS, '0')}`;
}

/** New proformas are issued straight away. */
export function createProforma(values, existing) {
  const fields = parseFormValues(values);
  const number = getNextNumber(existing, fields.date.slice(0, 4));
  return { id: number, number, ...fields, status: ISSUED, revision: 1 };
}

/**
 * A proforma has already gone to the customer, so every edit is a new revision, re-issued.
 * This also revives an expired proforma when its validity is extended.
 */
export function reviseProforma(proforma, values) {
  return {
    ...proforma,
    ...parseFormValues(values),
    status: ISSUED,
    revision: proforma.revision + 1,
  };
}

export function duplicateProforma(proforma, existing, today) {
  const date = toIsoDate(today);
  const number = getNextNumber(existing, date.slice(0, 4));
  return {
    ...proforma,
    id: number,
    number,
    date,
    validTill: toIsoDate(addDays(today, DEFAULT_VALIDITY_DAYS)),
    items: proforma.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
    status: ISSUED,
    revision: 1,
  };
}
