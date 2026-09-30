import { SelectField } from '@/components/SelectField';
import { SALESPERSONS } from '@/constants/team';

import {
  ALL_FILTER_VALUE,
  LEAD_SOURCES,
  LEAD_STATUS_LABELS,
  UNASSIGNED_FILTER_VALUE,
} from '../constants';
import styles from './LeadFilters.module.css';

const STATUS_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All statuses' },
  ...Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const SOURCE_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All sources' },
  ...LEAD_SOURCES.map((source) => ({ value: source, label: source })),
];

const SALESPERSON_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All salespersons' },
  { value: UNASSIGNED_FILTER_VALUE, label: 'Unassigned' },
  ...SALESPERSONS.map((salesperson) => ({ value: salesperson.id, label: salesperson.name })),
];

/**
 * @param {object} props
 * @param {{ query: string, status: string, source: string, salesperson: string }} props.filters
 * @param {(name: string, value: string) => void} props.onFilterChange
 */
export function LeadFilters({ filters, onFilterChange }) {
  function getSelectProps(name) {
    return {
      id: `lead-filter-${name}`,
      value: filters[name],
      isLabelHidden: true,
      onChange: (event) => onFilterChange(name, event.target.value),
    };
  }

  return (
    <div className={styles.filters}>
      <div className={styles.search}>
        <label htmlFor="lead-filter-query" className="visually-hidden">
          Filter leads
        </label>
        <input
          id="lead-filter-query"
          type="search"
          className={styles.searchInput}
          placeholder="Filter this list"
          value={filters.query}
          onChange={(event) => onFilterChange('query', event.target.value)}
        />
      </div>
      <SelectField label="Status" options={STATUS_OPTIONS} {...getSelectProps('status')} />
      <SelectField label="Source" options={SOURCE_OPTIONS} {...getSelectProps('source')} />
      <SelectField
        label="Salesperson"
        options={SALESPERSON_OPTIONS}
        {...getSelectProps('salesperson')}
      />
    </div>
  );
}
