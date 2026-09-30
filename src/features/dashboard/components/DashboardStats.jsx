import { StatGrid } from '@/components/StatGrid';

import { formatStatValue } from '../utils/formatters';

import styles from './DashboardStats.module.css';

/**
 * Dashboard headline figures, formatted for display.
 *
 * @param {object} props
 * @param {Array<{ id: string, label: string, value: number, format?: string, tone?: string }>} props.stats
 */
export function DashboardStats({ stats }) {
  const formattedStats = stats.map((stat) => ({
    ...stat,
    value: formatStatValue(stat.value, stat.format),
  }));

  return <StatGrid label="Key figures" stats={formattedStats} className={styles.stats} />;
}
