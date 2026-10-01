import {
  COPY_NAME_SUFFIX,
  CUSTOMER_NUMBER_DIGITS,
  CUSTOMER_NUMBER_PREFIX,
  CUSTOMER_STATUSES,
  CUSTOMER_TYPES,
} from '../constants';

export const EMPTY_CUSTOMER_FORM_VALUES = {
  name: '',
  contactName: '',
  mobile: '',
  type: CUSTOMER_TYPES.BUSINESS,
  gstin: '',
  state: 'Maharashtra',
  ownerId: '',
};

/** Form values for editing an existing customer. */
export function toFormValues(customer) {
  return {
    name: customer.name,
    contactName: customer.contactName,
    mobile: customer.mobile,
    type: customer.type,
    gstin: customer.gstin,
    state: customer.state,
    ownerId: customer.ownerId ?? '',
  };
}

/**
 * Form values for a new customer based on an existing one. The GSTIN is cleared
 * because it identifies one registered business and can't be shared.
 */
export function toCopyFormValues(customer) {
  return { ...toFormValues(customer), name: `${customer.name}${COPY_NAME_SUFFIX}`, gstin: '' };
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

function getNextCustomerNumber(customers, year) {
  const yearPrefix = `${CUSTOMER_NUMBER_PREFIX}-${year}-`;
  const highestSequence = customers
    .filter((customer) => customer.number.startsWith(yearPrefix))
    .reduce(
      (highest, customer) => Math.max(highest, Number(customer.number.slice(yearPrefix.length))),
      0,
    );

  return `${yearPrefix}${String(highestSequence + 1).padStart(CUSTOMER_NUMBER_DIGITS, '0')}`;
}

/**
 * A new active customer with no sales or linked records yet.
 *
 * @param {typeof EMPTY_CUSTOMER_FORM_VALUES} values
 * @param {object[]} existingCustomers - Used to pick the next customer number.
 * @param {Date} [createdAt]
 */
export function createCustomer(values, existingCustomers, createdAt = new Date()) {
  return {
    id: crypto.randomUUID(),
    number: getNextCustomerNumber(existingCustomers, createdAt.getFullYear()),
    ...cleanFormValues(values),
    totalSales: 0,
    outstanding: 0,
    linkedRecords: {},
    status: CUSTOMER_STATUSES.ACTIVE,
  };
}

/** Applies edited form values, keeping number, totals, linked records and status. */
export function updateCustomer(customer, values) {
  return { ...customer, ...cleanFormValues(values) };
}

export function setCustomerStatus(customers, customerIds, status) {
  return customers.map((customer) =>
    customerIds.includes(customer.id) ? { ...customer, status } : customer,
  );
}
