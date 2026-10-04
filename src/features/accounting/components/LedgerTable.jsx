import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { formatBalance } from '../utils/accounts';
import styles from './Accounting.module.css';

const formatAmount = (amount) => (amount > 0 ? formatCurrency(amount) : '');
const formatDate = (isoDate) => formatDayMonthYear(parseIsoDate(isoDate));

/**
 * An account's entries for a period with the balance brought forward, a running balance and the
 * closing balance.
 *
 * @param {object} props
 * @param {string} props.caption
 * @param {ReturnType<import('../utils/ledger').getLedger>} props.ledger
 * @param {{ from: string, to: string }} props.period
 * @param {string} [props.debitLabel='Debit'] - "Deposits" in a bank book.
 * @param {string} [props.creditLabel='Credit'] - "Withdrawals" in a bank book.
 */
export function LedgerTable({
  caption,
  ledger,
  period,
  debitLabel = 'Debit',
  creditLabel = 'Credit',
}) {
  return (
    <DataTable caption={caption} tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Voucher</th>
          <th scope="col">Particulars</th>
          <th scope="col" className={styles.numeric}>
            {debitLabel}
          </th>
          <th scope="col" className={styles.numeric}>
            {creditLabel}
          </th>
          <th scope="col" className={styles.numeric}>
            Balance
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className={styles.balanceRow}>
          <td className={styles.nowrap}>{formatDate(period.from)}</td>
          <td />
          <th scope="row">Opening balance</th>
          <td />
          <td />
          <td className={styles.numeric}>{formatBalance(ledger.opening)}</td>
        </tr>
        {ledger.entries.length === 0 && (
          <tr>
            <td colSpan={6} className={styles.empty}>
              No entries in this period.
            </td>
          </tr>
        )}
        {ledger.entries.map((entry) => (
          <tr key={entry.id}>
            <td className={styles.nowrap}>{formatDate(entry.date)}</td>
            <td className={styles.nowrap}>{entry.voucherNumber}</td>
            <td>
              {entry.particulars}
              <span className={styles.subtext}>
                {[entry.narration, entry.reference].filter(Boolean).join(', ')}
              </span>
            </td>
            <td className={styles.numeric}>{formatAmount(entry.debit)}</td>
            <td className={styles.numeric}>{formatAmount(entry.credit)}</td>
            <td className={styles.numeric}>{formatBalance(entry.balance)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td className={styles.nowrap}>{formatDate(period.to)}</td>
          <td />
          <th scope="row">Closing balance</th>
          <td className={styles.numeric}>{formatCurrency(ledger.debit)}</td>
          <td className={styles.numeric}>{formatCurrency(ledger.credit)}</td>
          <td className={styles.numeric}>{formatBalance(ledger.closing)}</td>
        </tr>
      </tfoot>
    </DataTable>
  );
}
