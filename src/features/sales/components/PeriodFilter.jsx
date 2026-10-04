import { PERIOD_LABELS, PERIODS } from '../constants';
import styles from './PeriodFilter.module.css';

/**
 * Period presets plus a custom from/to range, in one row above the figures.
 *
 * @param {object} props
 * @param {string} props.period - One of PERIODS.
 * @param {{ from: string, to: string }} props.range - The range in effect (ISO dates).
 * @param {(period: string) => void} props.onPeriodChange
 * @param {(range: { from: string, to: string }) => void} props.onCustomRangeChange
 */
export function PeriodFilter({ period, range, onPeriodChange, onCustomRangeChange }) {
  return (
    <div className={styles.filter}>
      <div className={styles.presets} role="group" aria-label="Period">
        {Object.entries(PERIOD_LABELS).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={styles.preset}
            aria-pressed={value === period}
            onClick={() => onPeriodChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {period === PERIODS.CUSTOM && (
        <div className={styles.custom}>
          <label htmlFor="sales-period-from">From</label>
          <input
            id="sales-period-from"
            type="date"
            className={styles.dateInput}
            value={range.from}
            max={range.to}
            onChange={(event) => onCustomRangeChange({ ...range, from: event.target.value })}
          />
          <label htmlFor="sales-period-to">to</label>
          <input
            id="sales-period-to"
            type="date"
            className={styles.dateInput}
            value={range.to}
            min={range.from}
            onChange={(event) => onCustomRangeChange({ ...range, to: event.target.value })}
          />
        </div>
      )}
    </div>
  );
}
