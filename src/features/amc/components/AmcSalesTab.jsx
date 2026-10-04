import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { getPaidAmount } from '../utils/merchantProfile';
import styles from './AmcDrawer.module.css';

/**
 * Non-AMC invoices for this outlet (setup, hardware, add-ons) and what's still due on each.
 *
 * @param {object} props
 * @param {object} props.contract
 */
export function AmcSalesTab({ contract }) {
  if (contract.sales.length === 0) {
    return <p className={styles.empty}>No sales invoices for this outlet yet.</p>;
  }

  return (
    <DataTable caption="Sales invoices" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Invoice</th>
          <th scope="col">Date</th>
          <th scope="col">Description</th>
          <th scope="col" className={styles.numeric}>
            Total
          </th>
          <th scope="col" className={styles.numeric}>
            Balance
          </th>
        </tr>
      </thead>
      <tbody>
        {contract.sales.map((sale) => (
          <tr key={sale.invoiceNumber}>
            <th scope="row" className={styles.nowrap}>
              {sale.invoiceNumber}
            </th>
            <td className={styles.nowrap}>{formatDayMonthYear(parseIsoDate(sale.date))}</td>
            <td>{sale.description}</td>
            <td className={styles.numeric}>{formatCurrency(sale.total)}</td>
            <td className={styles.numeric}>
              {formatCurrency(sale.total - getPaidAmount(contract, sale.invoiceNumber))}
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
