import { BADGE_TONES, Badge } from '@/components/Badge';
import { SALESPERSON_NAMES } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatMobile } from '@/utils/formatPhone';

import { MERCHANT_STATUSES, MERCHANT_STATUS_LABELS, MERCHANT_TYPE_LABELS } from '../constants';
import { getLinkedCounts } from '../utils/merchantDetails';
import { formatLinkedRecords } from '../utils/merchantQueries';
import styles from './MerchantsTable.module.css';

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
 * @param {object} props.merchant
 * @param {boolean} props.isSelected
 * @param {() => void} props.onToggleSelect
 * @param {() => void} props.onOpen - Opens the merchant's detail panel.
 * @param {() => void} props.onEdit
 * @param {() => void} props.onCopy
 * @param {() => void} props.onToggleStatus
 */
export function MerchantRow({
  merchant,
  isSelected,
  onToggleSelect,
  onOpen,
  onEdit,
  onCopy,
  onToggleStatus,
}) {
  const isActive = merchant.status === MERCHANT_STATUSES.ACTIVE;
  const linkedRecordsText = formatLinkedRecords(getLinkedCounts(merchant));
  const ownerName = SALESPERSON_NAMES.get(merchant.ownerId);
  const rowClassNames = [isSelected && styles.selectedRow, !isActive && styles.inactiveRow]
    .filter(Boolean)
    .join(' ');

  return (
    <tr className={rowClassNames || undefined}>
      <td className={styles.checkboxCell}>
        <input
          type="checkbox"
          aria-label={`Select ${merchant.name}`}
          checked={isSelected}
          onChange={onToggleSelect}
        />
      </td>
      <th scope="row" className={styles.merchantCell}>
        <button type="button" className={styles.nameButton} onClick={onOpen}>
          {merchant.name}
        </button>
        <span className={styles.secondary}>
          {merchant.number}
          {merchant.contactName && `, ${merchant.contactName}`}
        </span>
      </th>
      <td className={styles.nowrap}>{formatMobile(merchant.mobile)}</td>
      <td>{MERCHANT_TYPE_LABELS[merchant.type]}</td>
      <td className={styles.nowrap}>{merchant.gstin || <NoneCell />}</td>
      <td>{merchant.state}</td>
      <td className={styles.numeric}>{formatCurrency(merchant.totalSales)}</td>
      <td className={`${styles.numeric} ${merchant.outstanding > 0 ? styles.owed : ''}`}>
        {formatCurrency(merchant.outstanding)}
      </td>
      <td className={styles.linkedCell}>{linkedRecordsText || <NoneCell />}</td>
      <td>{ownerName ?? 'Unassigned'}</td>
      <td>
        <Badge tone={isActive ? BADGE_TONES.SUCCESS : BADGE_TONES.NEUTRAL}>
          {MERCHANT_STATUS_LABELS[merchant.status]}
        </Badge>
      </td>
      <td>
        <div className={styles.actions}>
          <button type="button" className={styles.editButton} onClick={onEdit}>
            Edit <span className="visually-hidden">{merchant.name}</span>
          </button>
          <button type="button" className={styles.textButton} onClick={onCopy}>
            Copy <span className="visually-hidden">{merchant.name}</span>
          </button>
          <button type="button" className={styles.textButton} onClick={onToggleStatus}>
            {isActive ? 'Deactivate' : 'Activate'}{' '}
            <span className="visually-hidden">{merchant.name}</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
