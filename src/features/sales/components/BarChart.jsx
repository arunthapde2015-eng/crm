import styles from './BarChart.module.css';

/**
 * Single-series horizontal bar chart, rendered as a table so the numbers are always readable
 * (and available to screen readers). Every bar carries its value as a direct label, and its
 * title doubles as a hover tooltip.
 *
 * @param {object} props
 * @param {string} props.title - Visible heading; also the table's accessible name.
 * @param {{ id: string, label: string, value: number }[]} props.rows
 * @param {(value: number) => string} props.formatValue
 */
export function BarChart({ title, rows, formatValue }) {
  const maxValue = Math.max(...rows.map((row) => row.value), 0);
  const hasData = maxValue > 0;

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.title}>{title}</figcaption>
      {hasData ? (
        <table className={styles.table}>
          <caption className="visually-hidden">{title}</caption>
          <tbody>
            {rows.map((row) => {
              const widthPercent = (row.value / maxValue) * 100;
              return (
                <tr key={row.id} title={`${row.label}: ${formatValue(row.value)}`}>
                  <th scope="row" className={styles.label}>
                    {row.label}
                  </th>
                  <td className={styles.barCell}>
                    {/* Width is the only data-driven style, so it's set inline. */}
                    <span className={styles.bar} style={{ width: `${widthPercent}%` }} />
                  </td>
                  <td className={styles.value}>{formatValue(row.value)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className={styles.empty}>No sales in this period.</p>
      )}
    </figure>
  );
}
