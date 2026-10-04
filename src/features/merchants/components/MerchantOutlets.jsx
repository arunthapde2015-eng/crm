import { InlineTextForm } from '@/components/InlineTextForm';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import styles from './MerchantDetails.module.css';

/**
 * @param {object} props
 * @param {object} props.merchant
 * @param {boolean} props.isFormOpen
 * @param {(outletName: string) => void} props.onAdd
 * @param {() => void} props.onCancel
 */
export function MerchantOutlets({ merchant, isFormOpen, onAdd, onCancel }) {
  return (
    <>
      {isFormOpen && (
        <InlineTextForm
          id={`new-outlet-${merchant.id}`}
          label="Outlet name"
          submitLabel="Save outlet"
          onSubmit={onAdd}
          onCancel={onCancel}
        />
      )}
      {merchant.outlets.length === 0 ? (
        <p className={styles.empty}>No outlets onboarded yet.</p>
      ) : (
        <ul className={styles.list}>
          {merchant.outlets.map((outlet) => (
            <li key={outlet.id}>
              {outlet.name}
              <span className={styles.listMeta}>
                Added {formatDayMonthYear(parseIsoDate(outlet.addedOn))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
