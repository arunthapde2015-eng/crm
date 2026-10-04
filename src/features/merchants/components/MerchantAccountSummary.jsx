import { formatCurrency } from '@/utils/formatCurrency';

import styles from './MerchantDetails.module.css';

// Shown under Sales, Payments and Ledger until billing records are linked per merchant.
const DETAIL_NOTE =
  'Individual invoices and receipts will be listed here once billing is connected to merchants.';

/**
 * Money figures for the Sales, Payments and Ledger tabs.
 *
 * @param {object} props
 * @param {{ label: string, amount?: number, count?: number }[]} props.items
 */
export function MerchantAccountSummary({ items }) {
  return (
    <>
      <dl className={styles.details}>
        {items.map(({ label, amount, count }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{amount === undefined ? count : formatCurrency(amount)}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.note}>{DETAIL_NOTE}</p>
    </>
  );
}
