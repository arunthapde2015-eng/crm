import { StatGrid } from '@/components/StatGrid';

import { formatStatValue } from '../utils/formatters';

import styles from './DashboardSection.module.css';

/**
 * A titled group of dashboard figures, formatted for display.
 *
 * @param {object} props
 * @param {string} props.title - Visible heading, also the grid's accessible name.
 * @param {Array<{ id: string, label: string, value: number, format?: string, tone?: string }>} props.stats
 */
export function DashboardStats({ title, stats }) {
  const formattedStats = stats.map((stat) => ({
    ...stat,
    value: formatStatValue(stat.value, stat.format),
  }));

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <StatGrid label={title} stats={formattedStats} />
    </div>
  );
}
