import { formatCurrency } from '@/utils/formatCurrency';

import styles from './Accounting.module.css';

/**
 * One side or section of a financial statement: named amounts and their total.
 *
 * @param {object} props
 * @param {string} props.title - e.g. "Income", "Assets".
 * @param {{ code: string, name: string, amount: number, note?: string }[]} props.rows
 *   A note (such as the account group) shows under the name.
 * @param {number} props.total
 * @param {string} [props.emptyText='Nothing in this period.']
 */
export function StatementSection({ title, rows, total, emptyText = 'Nothing in this period.' }) {
  return (
    <section aria-label={title} className={styles.statementSection}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <dl className={styles.statement}>
        {rows.length === 0 && <p className={styles.formNote}>{emptyText}</p>}
        {rows.map((row) => (
          <div key={row.code}>
            <dt>
              {row.name}
              {row.note && <span className={styles.subtext}>{row.note}</span>}
            </dt>
            <dd>{formatCurrency(row.amount)}</dd>
          </div>
        ))}
        <div className={styles.statementTotal}>
          <dt>Total {title.toLowerCase()}</dt>
          <dd>{formatCurrency(total)}</dd>
        </div>
      </dl>
    </section>
  );
}
