import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { getLedger } from '../utils/merchantProfile';
import styles from './AmcDrawer.module.css';

const formatAmount = (amount) => (amount > 0 ? formatCurrency(amount) : '');

/**
 * Statement of account: invoices, payments and the running balance.
 *
 * @param {object} props
 * @param {object} props.contract
 */
export function AmcLedgerTab({ contract }) {
  const { rows, debit, credit, balance } = getLedger(contract);

  return (
    <DataTable caption="Ledger" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Particulars</th>
          <th scope="col" className={styles.numeric}>
            Debit
          </th>
          <th scope="col" className={styles.numeric}>
            Credit
          </th>
          <th scope="col" className={styles.numeric}>
            Balance
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td className={styles.nowrap}>{formatDayMonthYear(parseIsoDate(row.date))}</td>
            <td>{row.description}</td>
            <td className={styles.numeric}>{formatAmount(row.debit)}</td>
            <td className={styles.numeric}>{formatAmount(row.credit)}</td>
            <td className={styles.numeric}>{formatCurrency(row.balance)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colSpan={2}>
            Balance due
          </th>
          <td className={styles.numeric}>{formatCurrency(debit)}</td>
          <td className={styles.numeric}>{formatCurrency(credit)}</td>
          <td className={styles.numeric}>{formatCurrency(balance)}</td>
        </tr>
      </tfoot>
    </DataTable>
  );
}
