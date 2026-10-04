import { DataTable } from '@/components/DataTable';
import { SALESPERSON_NAMES } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { getPayoutTotal } from '../utils/incentives';
import styles from './Incentives.module.css';

/**
 * @param {object} props
 * @param {object[]} props.payouts
 * @param {Map<string, object>} props.ordersById - To show order numbers for each payout.
 */
export function PayoutHistoryTable({ payouts, ordersById }) {
  const newestFirst = [...payouts].sort(
    (first, second) =>
      second.date.localeCompare(first.date) || second.number.localeCompare(first.number),
  );
  const grandTotal = payouts.reduce((sum, payout) => sum + getPayoutTotal(payout), 0);

  return (
    <DataTable caption="Payout history" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Payout</th>
          <th scope="col">Salesperson</th>
          <th scope="col">Orders</th>
          <th scope="col">Paid by</th>
          <th scope="col">Reference</th>
          <th scope="col" className={styles.numeric}>
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {newestFirst.length === 0 && (
          <tr>
            <td colSpan={6} className={styles.empty}>
              No payouts yet.
            </td>
          </tr>
        )}
        {newestFirst.map((payout) => (
          <tr key={payout.id}>
            <th scope="row" className={styles.nowrap}>
              {payout.number}
              <span className={styles.secondary}>
                {formatDayMonthYear(parseIsoDate(payout.date))}
              </span>
            </th>
            <td>{SALESPERSON_NAMES.get(payout.salespersonId) ?? 'Unassigned'}</td>
            <td>
              {payout.lines
                .map((line) => ordersById.get(line.orderId)?.number ?? line.orderId)
                .join(', ')}
            </td>
            <td>{payout.mode}</td>
            <td>{payout.reference || '—'}</td>
            <td className={styles.numeric}>{formatCurrency(getPayoutTotal(payout))}</td>
          </tr>
        ))}
      </tbody>
      {newestFirst.length > 0 && (
        <tfoot className={styles.totalRow}>
          <tr>
            <th scope="row" colSpan={5}>
              Total paid
            </th>
            <td className={styles.numeric}>{formatCurrency(grandTotal)}</td>
          </tr>
        </tfoot>
      )}
    </DataTable>
  );
}
