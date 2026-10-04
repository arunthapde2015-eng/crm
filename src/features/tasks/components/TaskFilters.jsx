import { SelectField } from '@/components/SelectField';

import { ALL_FILTER_VALUE, TASK_STATUS_LABELS } from '../constants';
import styles from './TaskFilters.module.css';

const STATUS_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All statuses' },
  ...Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

/**
 * @param {object} props
 * @param {{ query: string, status: string }} props.filters
 * @param {(name: string, value: string) => void} props.onFilterChange
 */
export function TaskFilters({ filters, onFilterChange }) {
  return (
    <div className={styles.filters}>
      <label htmlFor="task-filter-query" className="visually-hidden">
        Filter tasks
      </label>
      <input
        id="task-filter-query"
        type="search"
        className={styles.searchInput}
        placeholder="Filter this list"
        value={filters.query}
        onChange={(event) => onFilterChange('query', event.target.value)}
      />
      <SelectField
        id="task-filter-status"
        label="Status"
        isLabelHidden
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(event) => onFilterChange('status', event.target.value)}
      />
    </div>
  );
}
