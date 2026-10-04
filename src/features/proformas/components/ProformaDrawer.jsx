import { useEffect, useId, useState } from 'react';

import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { SALESPERSON_NAMES } from '@/constants/team';
import { printWithFileName } from '@/utils/print';

import { PROFORMA_STATUSES } from '../constants';
import {
  canConvert,
  getDisplayStatus,
  getMailtoUrl,
  getPrintFileName,
  getWhatsAppUrl,
  isOpen,
} from '../utils/proformas';
import { ProformaDocument } from './ProformaDocument';
import { ProformaStatusBadge } from './ProformaStatusBadge';
import styles from './ProformaDrawer.module.css';

/**
 * A proforma shown as its printable document, with the actions its state allows.
 *
 * @param {object} props
 * @param {object} props.proforma
 * @param {string} props.todayIsoDate
 * @param {boolean} props.shouldPrintOnOpen - Open the print dialog right away (row "PDF" link).
 * @param {() => void} props.onPrinted - Called once that automatic print has happened.
 * @param {ReturnType<import('../hooks/useProformas').useProformas>} props.actions
 * @param {() => void} props.onEdit
 * @param {() => void} props.onDuplicate
 * @param {() => void} props.onOpenQuotations
 * @param {() => void} props.onClose
 */
export function ProformaDrawer({
  proforma,
  todayIsoDate,
  shouldPrintOnOpen,
  onPrinted,
  actions,
  onEdit,
  onDuplicate,
  onOpenQuotations,
  onClose,
}) {
  const headingId = useId();
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const status = getDisplayStatus(proforma, todayIsoDate);
  const whatsAppUrl = getWhatsAppUrl(proforma);
  const fileName = getPrintFileName(proforma);
  const salesperson = SALESPERSON_NAMES.get(proforma.salespersonId);

  useEffect(() => {
    if (!shouldPrintOnOpen) return undefined;
    // Wait a frame so the document has painted before the print dialog snapshots it, then tell
    // the parent so the dialog doesn't open again on later renders.
    const frame = requestAnimationFrame(() => {
      printWithFileName(fileName);
      onPrinted();
    });
    return () => cancelAnimationFrame(frame);
  }, [shouldPrintOnOpen, fileName, onPrinted]);

  function confirmCancel() {
    actions.cancel(proforma.id);
    setIsConfirmingCancel(false);
  }

  return (
    <Drawer labelledBy={headingId} onClose={onClose}>
      <div className="print-hidden">
        <header className={styles.header}>
          <div>
            <h2 id={headingId} className={styles.title}>
              Proforma invoice {proforma.number}
              {proforma.revision > 1 && ` (rev. ${proforma.revision})`}
            </h2>
            <p className={styles.subtitle}>
              {proforma.customer.name}
              {salesperson && `, prepared by ${salesperson}`}
              {proforma.quotationRef && (
                <>
                  , from quotation{' '}
                  <button type="button" className={styles.link} onClick={onOpenQuotations}>
                    {proforma.quotationRef}
                  </button>
                </>
              )}
            </p>
          </div>
          <div className={styles.headerEnd}>
            <ProformaStatusBadge status={status} />
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Close proforma"
              onClick={onClose}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </header>

        {isConfirmingCancel ? (
          <div className={styles.confirm} role="alert">
            <p>
              Cancel {proforma.number}? It stays on record as cancelled and can’t be converted or
              edited afterwards.
            </p>
            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => setIsConfirmingCancel(false)}>
                Keep proforma
              </Button>
              <Button className={styles.dangerButton} onClick={confirmCancel}>
                Yes, cancel it
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.actions}>
            <Button onClick={() => printWithFileName(fileName)}>
              <span aria-hidden="true">⬇ </span>Download PDF
            </Button>
            {isOpen(proforma) && (
              <Button variant="secondary" onClick={onEdit}>
                Edit
              </Button>
            )}
            {canConvert(proforma, todayIsoDate) && (
              <Button onClick={() => actions.convert(proforma.id)}>Convert to invoice</Button>
            )}
            {isOpen(proforma) && (
              <Button
                variant="secondary"
                className={styles.cancelButton}
                onClick={() => setIsConfirmingCancel(true)}
              >
                Cancel
              </Button>
            )}
            <Button variant="secondary" onClick={onDuplicate}>
              Duplicate
            </Button>
            <Button variant="secondary" onClick={() => printWithFileName(fileName)}>
              Print
            </Button>
            {whatsAppUrl ? (
              <a className={styles.linkButton} href={whatsAppUrl} target="_blank" rel="noreferrer">
                Share on WhatsApp
              </a>
            ) : (
              <Button variant="secondary" disabled title="Add the customer’s 10-digit mobile first">
                Share on WhatsApp
              </Button>
            )}
            <a className={styles.linkButton} href={getMailtoUrl(proforma)}>
              Email
            </a>
          </div>
        )}
        {status === PROFORMA_STATUSES.EXPIRED && (
          <p className={styles.hint}>
            Validity has passed. Edit it with a new “Valid till” date to re-issue, or duplicate it.
          </p>
        )}
      </div>

      <ProformaDocument proforma={proforma} />
    </Drawer>
  );
}
