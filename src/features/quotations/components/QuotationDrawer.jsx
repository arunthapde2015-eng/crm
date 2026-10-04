import { useId } from 'react';

import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { printWithFileName } from '@/utils/print';

import {
  canEdit,
  getAvailableActions,
  getDisplayStatus,
  getPrintFileName,
  getSendBlocker,
} from '../utils/quotations';
import { ApprovalLabel, QuotationStatusBadge } from './QuotationBadges';
import { QuotationDocument } from './QuotationDocument';
import styles from './QuotationDrawer.module.css';

/**
 * A quotation shown as its printable document, with the actions its current state allows.
 *
 * @param {object} props
 * @param {object} props.quotation
 * @param {string} props.todayIsoDate
 * @param {ReturnType<import('../hooks/useQuotations').useQuotations>} props.actions
 * @param {() => void} props.onEdit
 * @param {() => void} props.onDuplicate
 * @param {() => void} props.onClose
 */
export function QuotationDrawer({
  quotation,
  todayIsoDate,
  actions,
  onEdit,
  onDuplicate,
  onClose,
}) {
  const headingId = useId();
  const status = getDisplayStatus(quotation, todayIsoDate);
  const available = getAvailableActions(quotation, todayIsoDate);
  const sendBlocker = available.canSend ? getSendBlocker(quotation) : null;
  const { id } = quotation;

  return (
    <Drawer labelledBy={headingId} onClose={onClose}>
      <div className="print-hidden">
        <header className={styles.header}>
          <div>
            <h2 id={headingId} className={styles.title}>
              Quotation {quotation.number}
              {quotation.revision > 1 && ` (rev. ${quotation.revision})`}
            </h2>
            <p className={styles.meta}>
              <QuotationStatusBadge status={status} />{' '}
              <ApprovalLabel approval={quotation.approval} />
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close quotation"
            onClick={onClose}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        <div className={styles.actions}>
          {available.canDecideApproval && (
            <>
              <Button onClick={() => actions.approveDiscount(id)}>Approve discount</Button>
              <Button variant="secondary" onClick={() => actions.rejectDiscount(id)}>
                Reject discount
              </Button>
            </>
          )}
          {available.canSend && (
            <Button onClick={() => actions.send(id)} disabled={Boolean(sendBlocker)}>
              Send to customer
            </Button>
          )}
          {available.canRecordResponse && (
            <>
              <Button onClick={() => actions.markAccepted(id)}>Mark accepted</Button>
              <Button variant="secondary" onClick={() => actions.markRejected(id)}>
                Mark rejected
              </Button>
            </>
          )}
          {available.canConvert && (
            <Button onClick={() => actions.convert(id)}>Convert to order</Button>
          )}
          {canEdit(quotation) && (
            <Button variant="secondary" onClick={onEdit}>
              Edit
            </Button>
          )}
          <Button variant="secondary" onClick={onDuplicate}>
            Duplicate
          </Button>
          <Button
            variant="secondary"
            onClick={() => printWithFileName(getPrintFileName(quotation))}
          >
            Print / PDF
          </Button>
        </div>
        {sendBlocker && <p className={styles.hint}>{sendBlocker}</p>}
      </div>

      <QuotationDocument quotation={quotation} />
    </Drawer>
  );
}
