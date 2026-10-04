import { Button } from '@/components/Button';

import { MERCHANT_STATUSES } from '../constants';
import styles from './BulkStatusBar.module.css';

/**
 * Shown while merchants are ticked: activates or deactivates them all at once.
 *
 * @param {object} props
 * @param {number} props.selectedCount
 * @param {(status: string) => void} props.onSetStatus
 * @param {() => void} props.onClear
 */
export function BulkStatusBar({ selectedCount, onSetStatus, onClear }) {
  return (
    <div className={styles.bar} role="group" aria-label="Bulk actions">
      <p className={styles.count}>{selectedCount} selected</p>
      <Button variant="secondary" onClick={() => onSetStatus(MERCHANT_STATUSES.ACTIVE)}>
        Mark active
      </Button>
      <Button variant="secondary" onClick={() => onSetStatus(MERCHANT_STATUSES.INACTIVE)}>
        Mark inactive
      </Button>
      <Button variant="ghost" onClick={onClear}>
        Clear selection
      </Button>
    </div>
  );
}
