import { SelectField } from '@/components/SelectField';
import { SALESPERSONS } from '@/constants/team';

import { ALL_FILTER_VALUE, ORDER_STATUS_LABELS, PAYOUT_FILTER_LABELS } from '../constants';
import styles from './Incentives.module.css';

const SALESPERSON_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All salespersons' },
  ...SALESPERSONS.map((person) => ({ value: person.id, label: person.name })),
];
const STATUS_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All order statuses' },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];
const PAYOUT_OPTIONS = Object.entries(PAYOUT_FILTER_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/**
 * @param {object} props
 * @param {object} props.filters
 * @param {(name: string, value: string) => void} props.onChange
 */
export function IncentiveFilters({ filters, onChange }) {
  function getSelectProps(name) {
    return {
      id: `incentive-filter-${name}`,
      isLabelHidden: true,
      value: filters[name],
      onChange: (event) => onChange(name, event.target.value),
    };
  }

  return (
    <div className={styles.filters}>
      <label htmlFor="incentive-filter-query" className="visually-hidden">
        Search incentives
      </label>
      <input
        id="incentive-filter-query"
        type="search"
        className={styles.control}
        placeholder="Order, customer or reference"
        value={filters.query}
        onChange={(event) => onChange('query', event.target.value)}
      />
      <SelectField
        label="Salesperson"
        options={SALESPERSON_OPTIONS}
        {...getSelectProps('salespersonId')}
      />
      <div className={styles.dateRange}>
        <label htmlFor="incentive-filter-from">From</label>
        <input
          id="incentive-filter-from"
          type="date"
          className={styles.control}
          value={filters.from}
          max={filters.to || undefined}
          onChange={(event) => onChange('from', event.target.value)}
        />
        <label htmlFor="incentive-filter-to">to</label>
        <input
          id="incentive-filter-to"
          type="date"
          className={styles.control}
          value={filters.to}
          min={filters.from || undefined}
          onChange={(event) => onChange('to', event.target.value)}
        />
      </div>
      <SelectField
        label="Order status"
        options={STATUS_OPTIONS}
        {...getSelectProps('orderStatus')}
      />
      <SelectField label="Payout" options={PAYOUT_OPTIONS} {...getSelectProps('payout')} />
    </div>
  );
}
