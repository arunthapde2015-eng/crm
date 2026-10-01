import { DataTable } from '@/components/DataTable';

import { CUSTOMER_STATUSES } from '../constants';
import { CustomerRow } from './CustomerRow';
import styles from './CustomersTable.module.css';

const COLUMN_COUNT = 12;

/**
 * @param {object} props
 * @param {object[]} props.customers - Customers to show, already filtered and sorted.
 * @param {ReturnType<import('@/hooks/useSelection').useSelection>} props.selection
 * @param {(customer: object) => void} props.onEdit
 * @param {(customer: object) => void} props.onCopy
 * @param {(customerIds: string[], status: string) => void} props.onSetStatus
 */
export function CustomersTable({ customers, selection, onEdit, onCopy, onSetStatus }) {
  function handleToggleStatus(customer) {
    const nextStatus =
      customer.status === CUSTOMER_STATUSES.ACTIVE
        ? CUSTOMER_STATUSES.INACTIVE
        : CUSTOMER_STATUSES.ACTIVE;
    onSetStatus([customer.id], nextStatus);
  }

  return (
    <DataTable caption="Customers" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col" className={styles.checkboxCell}>
            <input
              type="checkbox"
              aria-label="Select all shown customers"
              checked={selection.isAllSelected}
              // Indeterminate has no HTML attribute; it can only be set on the DOM node.
              ref={(node) => {
                if (node) node.indeterminate = selection.isPartlySelected;
              }}
              onChange={selection.toggleAllVisible}
              disabled={customers.length === 0}
            />
          </th>
          <th scope="col">Customer</th>
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
        {customers.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No customers match these filters.
            </td>
          </tr>
        )}
        {customers.map((customer) => (
          <CustomerRow
            key={customer.id}
            customer={customer}
            isSelected={selection.isSelected(customer.id)}
            onToggleSelect={() => selection.toggle(customer.id)}
            onEdit={() => onEdit(customer)}
            onCopy={() => onCopy(customer)}
            onToggleStatus={() => handleToggleStatus(customer)}
          />
        ))}
      </tbody>
    </DataTable>
  );
}
