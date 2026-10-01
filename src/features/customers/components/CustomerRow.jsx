import { BADGE_TONES, Badge } from '@/components/Badge';
import { SALESPERSON_NAMES } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatMobile } from '@/utils/formatPhone';

import { CUSTOMER_STATUSES, CUSTOMER_STATUS_LABELS, CUSTOMER_TYPE_LABELS } from '../constants';
import { formatLinkedRecords } from '../utils/customerQueries';
import styles from './CustomersTable.module.css';

function NoneCell() {
  return (
    <>
      <span aria-hidden="true">—</span>
      <span className="visually-hidden">None</span>
    </>
  );
}

/**
 * @param {object} props
 * @param {object} props.customer
 * @param {boolean} props.isSelected
 * @param {() => void} props.onToggleSelect
 * @param {() => void} props.onEdit
 * @param {() => void} props.onCopy
 * @param {() => void} props.onToggleStatus
 */
export function CustomerRow({
  customer,
  isSelected,
  onToggleSelect,
  onEdit,
  onCopy,
  onToggleStatus,
}) {
  const isActive = customer.status === CUSTOMER_STATUSES.ACTIVE;
  const linkedRecordsText = formatLinkedRecords(customer.linkedRecords);
  const ownerName = SALESPERSON_NAMES.get(customer.ownerId);
  const rowClassNames = [isSelected && styles.selectedRow, !isActive && styles.inactiveRow]
    .filter(Boolean)
    .join(' ');

  return (
    <tr className={rowClassNames || undefined}>
      <td className={styles.checkboxCell}>
        <input
          type="checkbox"
          aria-label={`Select ${customer.name}`}
          checked={isSelected}
          onChange={onToggleSelect}
        />
      </td>
      <th scope="row" className={styles.customerCell}>
        <span className={styles.primary}>{customer.name}</span>
        <span className={styles.secondary}>
          {customer.number}
          {customer.contactName && `, ${customer.contactName}`}
        </span>
      </th>
      <td className={styles.nowrap}>{formatMobile(customer.mobile)}</td>
      <td>{CUSTOMER_TYPE_LABELS[customer.type]}</td>
      <td className={styles.nowrap}>{customer.gstin || <NoneCell />}</td>
      <td>{customer.state}</td>
      <td className={styles.numeric}>{formatCurrency(customer.totalSales)}</td>
      <td className={`${styles.numeric} ${customer.outstanding > 0 ? styles.owed : ''}`}>
        {formatCurrency(customer.outstanding)}
      </td>
      <td className={styles.linkedCell}>{linkedRecordsText || <NoneCell />}</td>
      <td>{ownerName ?? 'Unassigned'}</td>
      <td>
        <Badge tone={isActive ? BADGE_TONES.SUCCESS : BADGE_TONES.NEUTRAL}>
          {CUSTOMER_STATUS_LABELS[customer.status]}
        </Badge>
      </td>
      <td>
        <div className={styles.actions}>
          <button type="button" className={styles.editButton} onClick={onEdit}>
            Edit <span className="visually-hidden">{customer.name}</span>
          </button>
          <button type="button" className={styles.textButton} onClick={onCopy}>
            Copy <span className="visually-hidden">{customer.name}</span>
          </button>
          <button type="button" className={styles.textButton} onClick={onToggleStatus}>
            {isActive ? 'Deactivate' : 'Activate'}{' '}
            <span className="visually-hidden">{customer.name}</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
