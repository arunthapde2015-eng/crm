import { DATE_PRESET_LABELS } from '../constants';
import styles from './DateRangeControls.module.css';

/**
 * From/to date pickers plus one-click presets. The preset matching the range is shown pressed.
 *
 * @param {object} props
 * @param {{ from: string, to: string }} props.range - ISO dates.
 * @param {string | null} props.activePreset
 * @param {(range: { from: string, to: string }) => void} props.onRangeChange
 * @param {(preset: string) => void} props.onPresetSelect
 */
export function DateRangeControls({ range, activePreset, onRangeChange, onPresetSelect }) {
  return (
    <div className={`${styles.controls} print-hidden`}>
      <div className={styles.dates}>
        <label htmlFor="report-from" className={styles.label}>
          From
        </label>
        <input
          id="report-from"
          type="date"
          className={styles.dateInput}
          value={range.from}
          max={range.to}
          onChange={(event) => onRangeChange({ ...range, from: event.target.value })}
        />
        <label htmlFor="report-to" className={styles.label}>
          to
        </label>
        <input
          id="report-to"
          type="date"
          className={styles.dateInput}
          value={range.to}
          min={range.from}
          onChange={(event) => onRangeChange({ ...range, to: event.target.value })}
        />
      </div>
      <div className={styles.presets} role="group" aria-label="Quick ranges">
        {Object.entries(DATE_PRESET_LABELS).map(([preset, label]) => (
          <button
            key={preset}
            type="button"
            className={styles.preset}
            aria-pressed={preset === activePreset}
            onClick={() => onPresetSelect(preset)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
