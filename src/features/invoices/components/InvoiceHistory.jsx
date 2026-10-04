import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { NOTE_TYPES, NOTE_TYPE_LABELS } from '../constants';
import styles from './InvoiceDrawer.module.css';

function formatDate(isoDate) {
  return formatDayMonthYear(parseIsoDate(isoDate));
}

/**
 * Payments received and credit/debit notes raised against an invoice, oldest first.
 *
 * @param {object} props
 * @param {object} props.invoice
 */
export function InvoiceHistory({ invoice }) {
  const entries = [
    ...invoice.payments.map((payment) => ({
      id: payment.id,
      date: payment.date,
      text: `Payment received by ${payment.mode}${payment.reference ? ` (${payment.reference})` : ''}`,
      amount: -payment.amount,
    })),
    ...invoice.notes.map((note) => ({
      id: note.id,
      date: note.date,
      text: `${NOTE_TYPE_LABELS[note.type]} ${note.number}: ${note.reason}`,
      amount: note.type === NOTE_TYPES.DEBIT ? note.amount : -note.amount,
    })),
  ].sort((first, second) => first.date.localeCompare(second.date));

  if (entries.length === 0) return null;

  return (
    <section className={styles.history} aria-label="Payments and notes">
      <h3 className={styles.panelTitle}>Payments and notes</h3>
      <ul className={styles.historyList}>
        {entries.map((entry) => (
          <li key={entry.id}>
            <span>
              {formatDate(entry.date)} · {entry.text}
            </span>
            <span className={entry.amount < 0 ? styles.credit : styles.debit}>
              {entry.amount < 0 ? '−' : '+'}
              {formatCurrency(Math.abs(entry.amount))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
