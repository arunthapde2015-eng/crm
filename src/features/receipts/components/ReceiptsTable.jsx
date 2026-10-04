import { BADGE_TONES, Badge } from '@/components/Badge';
import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { RECEIPT_STATUS_LABELS } from '../constants';
import { findInvoice, isCollected } from '../utils/receipts';
import styles from './Receipts.module.css';

const COLUMN_COUNT = 8;

/**
 * @param {object} props
 * @param {object[]} props.receipts - Already filtered and sorted.
 * @param {object[]} props.invoices - To show who each receipt is from.
 * @param {(receipt: object) => void} props.onOpen
 */
export function ReceiptsTable({ receipts, invoices, onOpen }) {
  return (
    <DataTable caption="Receipts" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Receipt</th>
          <th scope="col">Date</th>
          <th scope="col">Received from</th>
          <th scope="col">Invoice</th>
          <th scope="col">Mode</th>
          <th scope="col">Reference</th>
          <th scope="col">Account</th>
          <th scope="col" className={styles.numeric}>
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {receipts.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No receipts match these filters.
            </td>
          </tr>
        )}
        {receipts.map((receipt) => {
          const collected = isCollected(receipt);
          return (
            <tr key={receipt.id} className={collected ? undefined : styles.voidRow}>
              <th scope="row">
                <button
                  type="button"
                  className={styles.numberButton}
                  onClick={() => onOpen(receipt)}
                >
                  {receipt.number}
                </button>
                {!collected && (
                  <span className={styles.statusBadge}>
                    <Badge tone={BADGE_TONES.DANGER}>{RECEIPT_STATUS_LABELS[receipt.status]}</Badge>
                  </span>
                )}
              </th>
              <td className={styles.nowrap}>{formatDayMonthYear(parseIsoDate(receipt.date))}</td>
              <td>{findInvoice(invoices, receipt.invoiceNumber)?.customer ?? '—'}</td>
              <td className={styles.nowrap}>{receipt.invoiceNumber}</td>
              <td>{receipt.mode}</td>
              <td className={styles.nowrap}>{receipt.reference || '—'}</td>
              <td>{receipt.account}</td>
              <td className={`${styles.numeric} ${collected ? '' : styles.struck}`}>
                {formatCurrency(receipt.amount)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
