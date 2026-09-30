import styles from './StatGrid.module.css';

export const STAT_TONES = {
  DEFAULT: 'default',
  WARNING: 'warning',
  DANGER: 'danger',
};

/**
 * Bordered grid of headline figures, value above label.
 *
 * @param {object} props
 * @param {string} props.label - Accessible name for the region.
 * @param {Array<{ id: string, label: string, value: React.ReactNode, tone?: string }>} props.stats
 *   Values are rendered as-is, so format them first.
 * @param {string} [props.className] - Extra class names for the outer panel.
 */
export function StatGrid({ label, stats, className = '' }) {
  const panelClassNames = [styles.panel, className].filter(Boolean).join(' ');

  return (
    <section aria-label={label} className={panelClassNames}>
      <ul className={styles.grid}>
        {stats.map(({ id, label: statLabel, value, tone = STAT_TONES.DEFAULT }) => (
          <li key={id} className={styles.stat}>
            <span className={`${styles.value} ${styles[tone]}`}>{value}</span>
            <span className={styles.label}>{statLabel}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
