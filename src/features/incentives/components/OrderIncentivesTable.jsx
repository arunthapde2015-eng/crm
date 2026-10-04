import { BADGE_TONES, Badge } from '@/components/Badge';
import { DataTable } from '@/components/DataTable';
import { SALESPERSON_NAMES } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { ORDER_STATUS_LABELS } from '../constants';
import { isAwaitingPayout } from '../utils/incentives';
import styles from './Incentives.module.css';

const COLUMN_COUNT = 9;

function formatDate(isoDate) {
  return formatDayMonthYear(parseIsoDate(isoDate));
}

function PayoutCell({ row }) {
  if (row.isPaid) {
    return (
      <>
        <Badge tone={BADGE_TONES.SUCCESS}>Paid</Badge>
        <span className={styles.secondary}>
          {row.payout.number}, {formatDate(row.payout.date)}
        </span>
      </>
    );
  }
  if (!row.isEligible) return <Badge>Not eligible</Badge>;
  return <Badge tone={BADGE_TONES.WARNING}>Unpaid</Badge>;
}

/**
 * @param {object} props
 * @param {object[]} props.rows - Order incentive rows, already filtered.
 * @param {(row: object) => void} props.onPay - Starts a payout for one order.
 */
export function OrderIncentivesTable({ rows, onPay }) {
  return (
    <DataTable caption="Order-wise incentives" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Order</th>
          <th scope="col">Customer</th>
          <th scope="col">Salesperson</th>
          <th scope="col" className={styles.numeric}>
            Order value
          </th>
          <th scope="col">Order status</th>
          <th scope="col">Worked out as</th>
          <th scope="col" className={styles.numeric}>
            Incentive
          </th>
          <th scope="col">Payout</th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No orders match these filters.
            </td>
          </tr>
        )}
        {rows.map((row) => (
          <tr key={row.id}>
            <th scope="row" className={styles.nowrap}>
              {row.number}
              <span className={styles.secondary}>{formatDate(row.date)}</span>
            </th>
            <td>{row.customer}</td>
            <td>{SALESPERSON_NAMES.get(row.salespersonId) ?? 'Unassigned'}</td>
            <td className={styles.numeric}>{formatCurrency(row.value)}</td>
            <td>{ORDER_STATUS_LABELS[row.status]}</td>
            <td>{row.isPaid ? 'Amount locked at payout' : row.basis}</td>
            <td className={`${styles.numeric} ${isAwaitingPayout(row) ? styles.owed : ''}`}>
              {formatCurrency(row.amount)}
            </td>
            <td>
              <PayoutCell row={row} />
            </td>
            <td>
              {isAwaitingPayout(row) && (
                <button type="button" className={styles.outlineButton} onClick={() => onPay(row)}>
                  Mark paid <span className="visually-hidden">{row.number}</span>
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
