import {
  COPY_NAME_SUFFIX,
  MERCHANT_NUMBER_DIGITS,
  MERCHANT_NUMBER_PREFIX,
  MERCHANT_STATUSES,
  MERCHANT_TYPES,
} from '../constants';

export const EMPTY_MERCHANT_FORM_VALUES = {
  name: '',
  contactName: '',
  mobile: '',
  type: MERCHANT_TYPES.BUSINESS,
  gstin: '',
  state: 'Maharashtra',
  ownerId: '',
};

/** Form values for editing an existing merchant. */
export function toFormValues(merchant) {
  return {
    name: merchant.name,
    contactName: merchant.contactName,
    mobile: merchant.mobile,
    type: merchant.type,
    gstin: merchant.gstin,
    state: merchant.state,
    ownerId: merchant.ownerId ?? '',
  };
}

/**
 * Form values for a new merchant based on an existing one. The GSTIN is cleared
 * because it identifies one registered business and can't be shared.
 */
export function toCopyFormValues(merchant) {
  return { ...toFormValues(merchant), name: `${merchant.name}${COPY_NAME_SUFFIX}`, gstin: '' };
}

function cleanFormValues(values) {
  return {
    name: values.name.trim(),
    contactName: values.contactName.trim(),
    mobile: values.mobile.trim(),
    type: values.type,
    gstin: values.gstin.trim().toUpperCase(),
    state: values.state,
    ownerId: values.ownerId || null,
  };
}

function getNextMerchantNumber(merchants, year) {
  const yearPrefix = `${MERCHANT_NUMBER_PREFIX}-${year}-`;
  const highestSequence = merchants
    .filter((merchant) => merchant.number.startsWith(yearPrefix))
    .reduce(
      (highest, merchant) => Math.max(highest, Number(merchant.number.slice(yearPrefix.length))),
      0,
    );

  return `${yearPrefix}${String(highestSequence + 1).padStart(MERCHANT_NUMBER_DIGITS, '0')}`;
}

/**
 * A new active merchant with no sales or linked records yet.
 *
 * @param {typeof EMPTY_MERCHANT_FORM_VALUES} values
 * @param {object[]} existingMerchants - Used to pick the next merchant number.
 * @param {Date} [createdAt]
 */
export function createMerchant(values, existingMerchants, createdAt = new Date()) {
  return {
    id: crypto.randomUUID(),
    number: getNextMerchantNumber(existingMerchants, createdAt.getFullYear()),
    ...cleanFormValues(values),
    totalSales: 0,
    outstanding: 0,
    linkedRecords: {},
    status: MERCHANT_STATUSES.ACTIVE,
  };
}

/** Applies edited form values, keeping number, totals, linked records and status. */
export function updateMerchant(merchant, values) {
  return { ...merchant, ...cleanFormValues(values) };
}

export function setMerchantStatus(merchants, merchantIds, status) {
  return merchants.map((merchant) =>
    merchantIds.includes(merchant.id) ? { ...merchant, status } : merchant,
  );
}
