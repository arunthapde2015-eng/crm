import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { getPaymentsNewestFirst } from '../utils/merchantProfile';
import styles from './AmcDrawer.module.css';

/**
 * Money received from this outlet, AMC and sales, newest first.
 *
 * @param {object} props
 * @param {object} props.contract
 */
export function AmcPaymentsTab({ contract }) {
  const payments = getPaymentsNewestFirst(contract);
  if (payments.length === 0) {
    return <p className={styles.empty}>No payments received yet.</p>;
  }
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <DataTable caption="Payments" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Against</th>
          <th scope="col">Mode</th>
          <th scope="col">Reference</th>
          <th scope="col" className={styles.numeric}>
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {payments.map((payment, index) => (
          // Payments have no id of their own; the list is append-only, so the position is stable.
          <tr key={`${payment.date}-${payment.invoiceNumber}-${index}`}>
            <td className={styles.nowrap}>{formatDayMonthYear(parseIsoDate(payment.date))}</td>
            <td className={styles.nowrap}>{payment.invoiceNumber}</td>
            <td>{payment.mode}</td>
            <td className={styles.nowrap}>{payment.reference || '—'}</td>
            <td className={styles.numeric}>{formatCurrency(payment.amount)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colSpan={4}>
            Total received
          </th>
          <td className={styles.numeric}>{formatCurrency(total)}</td>
        </tr>
      </tfoot>
    </DataTable>
  );
}
