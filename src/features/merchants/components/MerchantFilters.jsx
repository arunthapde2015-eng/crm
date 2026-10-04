import { SelectField } from '@/components/SelectField';
import { SALESPERSONS } from '@/constants/team';

import { ALL_FILTER_VALUE, MERCHANT_STATUS_LABELS, MERCHANT_TYPE_LABELS } from '../constants';
import styles from './MerchantFilters.module.css';

function toOptions(labels) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

const STATUS_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All statuses' },
  ...toOptions(MERCHANT_STATUS_LABELS),
];
const TYPE_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All types' },
  ...toOptions(MERCHANT_TYPE_LABELS),
];
const OWNER_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All executives' },
  ...SALESPERSONS.map((salesperson) => ({ value: salesperson.id, label: salesperson.name })),
];

/**
 * @param {object} props
 * @param {{ query: string, status: string, type: string, state: string, ownerId: string }} props.filters
 * @param {string[]} props.states - States to offer in the state filter.
 * @param {(name: string, value: string) => void} props.onFilterChange
 */
export function MerchantFilters({ filters, states, onFilterChange }) {
  const stateOptions = [
    { value: ALL_FILTER_VALUE, label: 'All states' },
    ...states.map((state) => ({ value: state, label: state })),
  ];

  function getSelectProps(name) {
    return {
      id: `merchant-filter-${name}`,
      value: filters[name],
      isLabelHidden: true,
      onChange: (event) => onFilterChange(name, event.target.value),
    };
  }

  return (
    <div className={styles.filters}>
      <div className={styles.search}>
        <label htmlFor="merchant-filter-query" className="visually-hidden">
          Filter merchants
        </label>
        <input
          id="merchant-filter-query"
          type="search"
          className={styles.searchInput}
          placeholder="Filter this list"
          value={filters.query}
          onChange={(event) => onFilterChange('query', event.target.value)}
        />
      </div>
      <SelectField label="Status" options={STATUS_OPTIONS} {...getSelectProps('status')} />
      <SelectField label="Type" options={TYPE_OPTIONS} {...getSelectProps('type')} />
      <SelectField label="State" options={stateOptions} {...getSelectProps('state')} />
      <SelectField label="Executive" options={OWNER_OPTIONS} {...getSelectProps('ownerId')} />
    </div>
  );
}
