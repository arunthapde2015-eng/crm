import { DataTable } from '@/components/DataTable';

import { getToggledStatus } from '../utils/merchantDetails';
import { MerchantRow } from './MerchantRow';
import styles from './MerchantsTable.module.css';

const COLUMN_COUNT = 12;

/**
 * @param {object} props
 * @param {object[]} props.merchants - Merchants to show, already filtered and sorted.
 * @param {ReturnType<import('@/hooks/useSelection').useSelection>} props.selection
 * @param {(merchant: object) => void} props.onOpen - Opens the detail panel.
 * @param {(merchant: object) => void} props.onEdit
 * @param {(merchant: object) => void} props.onCopy
 * @param {(merchantIds: string[], status: string) => void} props.onSetStatus
 */
export function MerchantsTable({ merchants, selection, onOpen, onEdit, onCopy, onSetStatus }) {
  return (
    <DataTable caption="Merchants" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col" className={styles.checkboxCell}>
            <input
              type="checkbox"
              aria-label="Select all shown merchants"
              checked={selection.isAllSelected}
              // Indeterminate has no HTML attribute; it can only be set on the DOM node.
              ref={(node) => {
                if (node) node.indeterminate = selection.isPartlySelected;
              }}
              onChange={selection.toggleAllVisible}
              disabled={merchants.length === 0}
            />
          </th>
          <th scope="col">Merchant</th>
          <th scope="col">Mobile</th>
          <th scope="col">Type</th>
          <th scope="col">GSTIN</th>
          <th scope="col">State</th>
          <th scope="col" className={styles.numeric}>
            Sales
          </th>
          <th scope="col" className={styles.numeric}>
            Outstanding
          </th>
          <th scope="col">Linked records</th>
          <th scope="col">Owner</th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {merchants.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No merchants match these filters.
            </td>
          </tr>
        )}
        {merchants.map((merchant) => (
          <MerchantRow
            key={merchant.id}
            merchant={merchant}
            isSelected={selection.isSelected(merchant.id)}
            onToggleSelect={() => selection.toggle(merchant.id)}
            onOpen={() => onOpen(merchant)}
            onEdit={() => onEdit(merchant)}
            onCopy={() => onCopy(merchant)}
            onToggleStatus={() => onSetStatus([merchant.id], getToggledStatus(merchant))}
          />
        ))}
      </tbody>
    </DataTable>
  );
}
