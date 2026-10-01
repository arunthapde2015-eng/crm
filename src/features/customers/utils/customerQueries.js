import { ALL_FILTER_VALUE, CUSTOMER_STATUSES, LINKED_RECORD_KINDS } from '../constants';

function matchesQuery(customer, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === '') return true;

  const searchableText = [
    customer.name,
    customer.number,
    customer.contactName,
    customer.mobile,
    customer.gstin,
  ]
    .join(' ')
    .toLowerCase();
  // Mobile numbers are displayed with a space, so ignore spaces when matching digits.
  return (
    searchableText.includes(normalizedQuery) ||
    customer.mobile.includes(normalizedQuery.replaceAll(' ', ''))
  );
}

function matchesFilter(value, filterValue) {
  return filterValue === ALL_FILTER_VALUE || value === filterValue;
}

/**
 * Customers matching every filter, sorted by name.
 *
 * @param {object[]} customers
 * @param {{ query: string, status: string, type: string, state: string, ownerId: string }} filters
 */
export function filterCustomers(customers, { query, status, type, state, ownerId }) {
  return customers
    .filter(
      (customer) =>
        matchesQuery(customer, query) &&
        matchesFilter(customer.status, status) &&
        matchesFilter(customer.type, type) &&
        matchesFilter(customer.state, state) &&
        matchesFilter(customer.ownerId, ownerId),
    )
    .sort((first, second) => first.name.localeCompare(second.name));
}

/** "6 customers, 6 active." */
export function getCustomerSummary(customers) {
  const activeCount = customers.filter(
    (customer) => customer.status === CUSTOMER_STATUSES.ACTIVE,
  ).length;
  const noun = customers.length === 1 ? 'customer' : 'customers';
  return `${customers.length} ${noun}, ${activeCount} active.`;
}

/** { merchants: 2, invoices: 1 } → "2 merchants, 1 invoice"; nothing linked → "". */
export function formatLinkedRecords(linkedRecords) {
  return LINKED_RECORD_KINDS.filter(({ key }) => linkedRecords[key] > 0)
    .map(({ key, singular, plural }) => {
      const count = linkedRecords[key];
      return `${count} ${count === 1 ? singular : plural}`;
    })
    .join(', ');
}

/** States that appear in the list, for the state filter. */
export function getCustomerStates(customers) {
  return [...new Set(customers.map((customer) => customer.state))].sort();
}
