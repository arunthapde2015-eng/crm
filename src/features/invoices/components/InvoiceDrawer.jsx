import { useEffect, useId, useState } from 'react';

import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { SALESPERSON_NAMES } from '@/constants/team';
import { toIsoDate } from '@/utils/formatDate';
import { printWithFileName } from '@/utils/print';

import {
  canEdit,
  canRecordPayment,
  createNote,
  createPayment,
  getCancelBlocker,
  getDisplayStatus,
  getIncentiveNote,
  getMailtoUrl,
  getPrintFileName,
  getWhatsAppUrl,
  isBilled,
} from '../utils/invoices';
import { InvoiceDocument } from './InvoiceDocument';
import { InvoiceHistory } from './InvoiceHistory';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { NoteForm } from './NoteForm';
import { RecordPaymentForm } from './RecordPaymentForm';
import styles from './InvoiceDrawer.module.css';

const PANELS = { PAYMENT: 'payment', NOTE: 'note', CANCEL: 'cancel' };

/**
 * A sales invoice as its printable tax invoice, with the actions its state allows.
 *
 * @param {object} props
 * @param {object} props.invoice
 * @param {object[]} props.allInvoices - For numbering credit/debit notes.
 * @param {Date} props.today
 * @param {boolean} props.shouldPrintOnOpen
 * @param {() => void} props.onPrinted
 * @param {ReturnType<import('../hooks/useInvoices').useInvoices>} props.actions
 * @param {() => void} props.onEdit
 * @param {() => void} props.onDuplicate
 * @param {() => void} props.onClose
 */
export function InvoiceDrawer({
  invoice,
  allInvoices,
  today,
  shouldPrintOnOpen,
  onPrinted,
  actions,
  onEdit,
  onDuplicate,
  onClose,
}) {
  const headingId = useId();
  const [openPanel, setOpenPanel] = useState(null);
  const todayIsoDate = toIsoDate(today);
  const status = getDisplayStatus(invoice, todayIsoDate);
  const salesperson = SALESPERSON_NAMES.get(invoice.salespersonId);
  const fileName = getPrintFileName(invoice);
  const whatsAppUrl = getWhatsAppUrl(invoice);
  const cancelBlocker = getCancelBlocker(invoice);

  useEffect(() => {
    if (!shouldPrintOnOpen) return undefined;
    // Wait a frame so the document has painted before the print dialog snapshots it.
    const frame = requestAnimationFrame(() => {
      printWithFileName(fileName);
      onPrinted();
    });
    return () => cancelAnimationFrame(frame);
  }, [shouldPrintOnOpen, fileName, onPrinted]);

  function renderPanel() {
    switch (openPanel) {
      case PANELS.PAYMENT:
        return (
          <RecordPaymentForm
            invoice={invoice}
            today={today}
            onSubmit={(values) => {
              actions.addPayment(invoice.id, createPayment(values));
              setOpenPanel(null);
            }}
            onCancel={() => setOpenPanel(null)}
          />
        );
      case PANELS.NOTE:
        return (
          <NoteForm
            invoice={invoice}
            today={today}
            onSubmit={(values) => {
              actions.addNote(invoice.id, createNote(values, allInvoices));
              setOpenPanel(null);
            }}
            onCancel={() => setOpenPanel(null)}
          />
        );
      case PANELS.CANCEL:
        return (
          <div className={styles.confirm} role="alert">
            <p>
              Cancel {invoice.number}? It stays on record as cancelled, and its balance is no longer
              owed.
            </p>
            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => setOpenPanel(null)}>
                Keep invoice
              </Button>
              <Button
                className={styles.dangerButton}
                onClick={() => {
                  actions.cancel(invoice.id);
                  setOpenPanel(null);
                }}
              >
                Yes, cancel invoice
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <Drawer labelledBy={headingId} onClose={onClose}>
      <div className={`${styles.chrome} print-hidden`}>
        <header className={styles.header}>
          <div>
            <h2 id={headingId} className={styles.title}>
              Sales invoice {invoice.number}
            </h2>
            <p className={styles.subtitle}>
              {invoice.customer.name}
              {salesperson && `, prepared by ${salesperson}`}
            </p>
          </div>
          <div className={styles.headerEnd}>
            <InvoiceStatusBadge status={status} />
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Close invoice"
              onClick={onClose}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </header>

        <div className={styles.actions}>
          <Button onClick={() => printWithFileName(fileName)}>
            <span aria-hidden="true">⬇ </span>Download PDF
          </Button>
          {canRecordPayment(invoice) && (
            <Button onClick={() => setOpenPanel(PANELS.PAYMENT)}>Record payment</Button>
          )}
          {canEdit(invoice) && (
            <>
              <Button onClick={() => actions.issue(invoice.id)}>Issue invoice</Button>
              <Button variant="secondary" onClick={onEdit}>
                Edit draft
              </Button>
            </>
          )}
          {isBilled(invoice) && (
            <Button variant="secondary" onClick={() => setOpenPanel(PANELS.NOTE)}>
              Credit / debit note
            </Button>
          )}
          {isBilled(invoice) && (
            <Button
              variant="secondary"
              className={styles.cancelButton}
              onClick={() => setOpenPanel(PANELS.CANCEL)}
              disabled={Boolean(cancelBlocker)}
              title={cancelBlocker ?? undefined}
            >
              Cancel invoice
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
          <a className={styles.linkButton} href={getMailtoUrl(invoice)}>
            Email
          </a>
        </div>
        {isBilled(invoice) && cancelBlocker && (
          <p className={styles.hint}>Cancel unavailable: {cancelBlocker}</p>
        )}

        <p className={styles.info}>{getIncentiveNote(invoice, salesperson)}</p>
        {renderPanel()}
        <InvoiceHistory invoice={invoice} />
      </div>

      <InvoiceDocument invoice={invoice} />
    </Drawer>
  );
}
