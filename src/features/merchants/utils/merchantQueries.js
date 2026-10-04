import { ALL_FILTER_VALUE, MERCHANT_STATUSES, LINKED_RECORD_KINDS } from '../constants';

function matchesQuery(merchant, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === '') return true;

  const searchableText = [
    merchant.name,
    merchant.number,
    merchant.contactName,
    merchant.mobile,
    merchant.gstin,
  ]
    .join(' ')
    .toLowerCase();
  // Mobile numbers are displayed with a space, so ignore spaces when matching digits.
  return (
    searchableText.includes(normalizedQuery) ||
    merchant.mobile.includes(normalizedQuery.replaceAll(' ', ''))
  );
}

function matchesFilter(value, filterValue) {
  return filterValue === ALL_FILTER_VALUE || value === filterValue;
}

/**
 * Merchants matching every filter, sorted by name.
 *
 * @param {object[]} merchants
 * @param {{ query: string, status: string, type: string, state: string, ownerId: string }} filters
 */
export function filterMerchants(merchants, { query, status, type, state, ownerId }) {
  return merchants
    .filter(
      (merchant) =>
        matchesQuery(merchant, query) &&
        matchesFilter(merchant.status, status) &&
        matchesFilter(merchant.type, type) &&
        matchesFilter(merchant.state, state) &&
        matchesFilter(merchant.ownerId, ownerId),
    )
    .sort((first, second) => first.name.localeCompare(second.name));
}

/** "6 merchants, 6 active." */
export function getMerchantSummary(merchants) {
  const activeCount = merchants.filter(
    (merchant) => merchant.status === MERCHANT_STATUSES.ACTIVE,
  ).length;
  const noun = merchants.length === 1 ? 'merchant' : 'merchants';
  return `${merchants.length} ${noun}, ${activeCount} active.`;
}

/** { outlets: 2, invoices: 1 } → "2 outlets, 1 invoice"; nothing linked → "". */
export function formatLinkedRecords(linkedRecords) {
  return LINKED_RECORD_KINDS.filter(({ key }) => linkedRecords[key] > 0)
    .map(({ key, singular, plural }) => {
      const count = linkedRecords[key];
      return `${count} ${count === 1 ? singular : plural}`;
    })
    .join(', ');
}

/** States that appear in the list, for the state filter. */
export function getMerchantStates(merchants) {
  return [...new Set(merchants.map((merchant) => merchant.state))].sort();
}
