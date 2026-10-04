import { DataTable } from '@/components/DataTable';
import { SALESPERSON_NAMES } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';
import { getTaxable, getTotal } from '@/utils/lineItems';

import { INVOICE_KINDS } from '../constants';
import { getBalance, getDisplayStatus } from '../utils/invoices';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import styles from './Invoices.module.css';

const COLUMN_COUNT = 10;

function formatDate(isoDate) {
  return formatDayMonthYear(parseIsoDate(isoDate));
}

/**
 * @param {object} props
 * @param {object[]} props.invoices - Already filtered and sorted.
 * @param {string} props.todayIsoDate
 * @param {(invoice: object) => void} props.onOpen
 * @param {(invoice: object) => void} props.onDownload - Opens the invoice and its print dialog.
 */
export function InvoicesTable({ invoices, todayIsoDate, onOpen, onDownload }) {
  return (
    <DataTable caption="Sales invoices" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">No.</th>
          <th scope="col">Date</th>
          <th scope="col">Customer / merchant</th>
          <th scope="col">Due</th>
          <th scope="col" className={styles.numeric}>
            Taxable
          </th>
          <th scope="col" className={styles.numeric}>
            Total
          </th>
          <th scope="col" className={styles.numeric}>
            Balance
          </th>
          <th scope="col">Salesperson</th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className="visually-hidden">Download</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {invoices.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No invoices match these filters.
            </td>
          </tr>
        )}
        {invoices.map((invoice) => (
          <tr key={invoice.id}>
            <th scope="row">
              <button type="button" className={styles.numberButton} onClick={() => onOpen(invoice)}>
                {invoice.number}
              </button>
              {invoice.kind === INVOICE_KINDS.AMC && <span className={styles.secondary}>AMC</span>}
            </th>
            <td className={styles.nowrap}>{formatDate(invoice.date)}</td>
            <td>{invoice.customer.name}</td>
            <td className={styles.nowrap}>{formatDate(invoice.dueDate)}</td>
            <td className={styles.numeric}>{formatCurrency(getTaxable(invoice))}</td>
            <td className={styles.numeric}>{formatCurrency(getTotal(invoice))}</td>
            <td className={styles.numeric}>{formatCurrency(getBalance(invoice))}</td>
            <td>{SALESPERSON_NAMES.get(invoice.salespersonId) ?? 'Unassigned'}</td>
            <td>
              <InvoiceStatusBadge status={getDisplayStatus(invoice, todayIsoDate)} />
            </td>
            <td>
              <button
                type="button"
                className={styles.textButton}
                onClick={() => onDownload(invoice)}
              >
                <span aria-hidden="true">⬇ </span>PDF{' '}
                <span className="visually-hidden">of {invoice.number}</span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
