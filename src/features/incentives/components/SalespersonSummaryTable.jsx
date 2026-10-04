import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { describeRule } from '../utils/rules';
import { PersonCell } from './PersonCell';
import styles from './Incentives.module.css';

/**
 * @param {object} props
 * @param {object[]} props.summary - From getSalespersonSummary.
 * @param {object} props.totals - From summariseIncentives over the same rows.
 * @param {(salespersonId: string) => void} props.onViewOrders
 * @param {(salespersonId: string) => void} props.onSetRate
 * @param {(salespersonId: string) => void} props.onPayAll
 */
export function SalespersonSummaryTable({ summary, totals, onViewOrders, onSetRate, onPayAll }) {
  return (
    <DataTable caption="Incentives by salesperson" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Salesperson</th>
          <th scope="col">Current rate</th>
          <th scope="col" className={styles.numeric}>
            Orders
          </th>
          <th scope="col" className={styles.numeric}>
            Earned
          </th>
          <th scope="col" className={styles.numeric}>
            Paid
          </th>
          <th scope="col" className={styles.numeric}>
            Unpaid
          </th>
          <th scope="col" className={styles.numeric}>
            Pending
          </th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {summary.map((row) => (
          <tr key={row.id}>
            <th scope="row">
              <PersonCell name={row.name} designation={row.designation} />
            </th>
            <td>{row.rule ? describeRule(row.rule) : 'No rate set'}</td>
            <td className={styles.numeric}>{row.orderCount}</td>
            <td className={styles.numeric}>{formatCurrency(row.earned)}</td>
            <td className={styles.numeric}>{formatCurrency(row.paid)}</td>
            <td className={`${styles.numeric} ${row.unpaid > 0 ? styles.owed : ''}`}>
              {formatCurrency(row.unpaid)}
            </td>
            <td className={styles.numeric}>
              {row.awaitingCount}
              {row.oldestPendingDate && (
                <span className={styles.secondary}>
                  since {formatDayMonthYear(parseIsoDate(row.oldestPendingDate))}
                </span>
              )}
            </td>
            <td>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.outlineButton}
                  onClick={() => onViewOrders(row.id)}
                >
                  View orders <span className="visually-hidden">for {row.name}</span>
                </button>
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => onSetRate(row.id)}
                >
                  Set rate <span className="visually-hidden">for {row.name}</span>
                </button>
                {row.awaitingCount > 0 && (
                  <button
                    type="button"
                    className={`${styles.outlineButton} ${styles.primaryButton}`}
                    onClick={() => onPayAll(row.id)}
                  >
                    Pay all pending <span className="visually-hidden">for {row.name}</span>
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot className={styles.totalRow}>
        <tr>
          <th scope="row" colSpan={2}>
            Total
          </th>
          <td className={styles.numeric}>{totals.orderCount}</td>
          <td className={styles.numeric}>{formatCurrency(totals.earned)}</td>
          <td className={styles.numeric}>{formatCurrency(totals.paid)}</td>
          <td className={styles.numeric}>{formatCurrency(totals.unpaid)}</td>
          <td className={styles.numeric}>{totals.awaitingCount}</td>
          <td />
        </tr>
      </tfoot>
    </DataTable>
  );
}
