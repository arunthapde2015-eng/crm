import styles from './ProgressBar.module.css';

const FULL = 100;

/**
 * Target progress meter. The fill is capped at 100% while the label shows the real figure.
 *
 * @param {object} props
 * @param {number} props.percent - Achievement %, may exceed 100.
 * @param {string} props.label - Accessible name, e.g. "Rohan Kulkarni target".
 */
export function ProgressBar({ percent, label }) {
  const fillPercent = Math.min(percent, FULL);
  const isMet = percent >= FULL;

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.track}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={FULL}
        aria-valuenow={fillPercent}
        aria-valuetext={`${percent}%`}
      >
        {/* Width is the only data-driven style, so it's set inline. */}
        <span
          className={isMet ? styles.fillMet : styles.fill}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
      <span className={styles.percent}>{percent}%</span>
    </div>
  );
}
