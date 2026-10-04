import { useState } from 'react';

import { Button } from '@/components/Button';

import { getDeleteBlocker, isActiveMerchant } from '../utils/merchantDetails';
import styles from './MerchantActions.module.css';

/**
 * Action buttons for one merchant. Delete asks for confirmation first, and is unavailable when
 * the merchant has financial records.
 *
 * @param {object} props
 * @param {object} props.merchant
 * @param {() => void} props.onNewQuotation
 * @param {() => void} props.onNewInvoice
 * @param {() => void} props.onAddOutlet
 * @param {() => void} props.onAddRemark
 * @param {() => void} props.onStatement
 * @param {() => void} props.onEdit
 * @param {() => void} props.onCopy
 * @param {() => void} props.onToggleStatus
 * @param {() => void} props.onDelete
 */
export function MerchantActions({
  merchant,
  onNewQuotation,
  onNewInvoice,
  onAddOutlet,
  onAddRemark,
  onStatement,
  onEdit,
  onCopy,
  onToggleStatus,
  onDelete,
}) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const isActive = isActiveMerchant(merchant);
  const deleteBlocker = getDeleteBlocker(merchant);

  if (isConfirmingDelete) {
    return (
      <div className={styles.confirm} role="alert">
        <p className={styles.confirmText}>Delete {merchant.name}? This can’t be undone.</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setIsConfirmingDelete(false)}>
            Keep merchant
          </Button>
          <Button className={styles.dangerButton} onClick={onDelete}>
            Yes, delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.actions}>
        {/* Inactive merchants can't be picked for new quotations, invoices or outlets. */}
        <Button onClick={onNewQuotation} disabled={!isActive}>
          New quotation
        </Button>
        <Button variant="secondary" onClick={onNewInvoice} disabled={!isActive}>
          New invoice
        </Button>
        <Button variant="secondary" onClick={onAddOutlet} disabled={!isActive}>
          Add outlet
        </Button>
        <Button variant="secondary" onClick={onAddRemark}>
          Add remark
        </Button>
        <Button variant="secondary" onClick={onStatement}>
          Statement
        </Button>
        <Button variant="secondary" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="secondary" onClick={onCopy}>
          Copy
        </Button>
        <Button variant="secondary" onClick={onToggleStatus}>
          {isActive ? 'Deactivate' : 'Activate'}
        </Button>
        <Button
          variant="secondary"
          className={styles.deleteButton}
          onClick={() => setIsConfirmingDelete(true)}
          disabled={Boolean(deleteBlocker)}
          aria-describedby={deleteBlocker ? `delete-blocker-${merchant.id}` : undefined}
        >
          Delete
        </Button>
      </div>
      {deleteBlocker && (
        <p id={`delete-blocker-${merchant.id}`} className={styles.hint}>
          Delete is unavailable: {deleteBlocker}
        </p>
      )}
      {!isActive && (
        <p className={styles.hint}>
          Inactive: activate this merchant to raise quotations or invoices, or add outlets.
        </p>
      )}
    </>
  );
}
