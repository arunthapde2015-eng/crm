import { useId, useState } from 'react';

import { BADGE_TONES, Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { TextField } from '@/components/TextField';
import { CASH_MODE } from '@/constants/payments';
import { toIsoDate } from '@/utils/formatDate';
import { printWithFileName } from '@/utils/print';

import { RECEIPT_STATUSES, RECEIPT_STATUS_LABELS } from '../constants';
import { getMailtoUrl, getPrintFileName, getWhatsAppUrl, isCollected } from '../utils/receipts';
import { ReceiptDocument } from './ReceiptDocument';
import styles from './ReceiptDrawer.module.css';

const VOID_COPY = {
  [RECEIPT_STATUSES.BOUNCED]: {
    question: 'Mark this payment as bounced?',
    explanation: 'Use this when the cheque was returned or the transfer was reversed.',
    confirm: 'Mark bounced',
  },
  [RECEIPT_STATUSES.CANCELLED]: {
    question: 'Cancel this receipt?',
    explanation: 'Use this when the receipt was entered by mistake.',
    confirm: 'Cancel receipt',
  },
};

/**
 * Bounce/cancel confirmation. A reason is required, because the receipt stays on record and
 * the invoice it was against becomes payable again.
 */
function VoidForm({ status, receipt, onConfirm, onBack }) {
  const [reason, setReason] = useState('');
  const copy = VOID_COPY[status];

  function handleSubmit(event) {
    event.preventDefault();
    if (reason.trim()) onConfirm(reason);
  }

  return (
    <form className={styles.confirm} onSubmit={handleSubmit} aria-label={copy.question}>
      <p>
        <strong>{copy.question}</strong> {copy.explanation} {receipt.number} stays on record, and
        invoice {receipt.invoiceNumber} becomes payable again.
      </p>
      <TextField
        id="void-reason"
        label="Reason"
        required
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onBack}>
          Keep receipt
        </Button>
        <Button type="submit" className={styles.dangerButton} disabled={!reason.trim()}>
          {copy.confirm}
        </Button>
      </div>
    </form>
  );
}

/**
 * @param {object} props
 * @param {object} props.receipt
 * @param {object} props.invoice
 * @param {Date} props.today
 * @param {(status: string, reason: string, date: string) => void} props.onVoid
 * @param {() => void} props.onClose
 */
export function ReceiptDrawer({ receipt, invoice, today, onVoid, onClose }) {
  const headingId = useId();
  const [voidStatus, setVoidStatus] = useState(null);
  const collected = isCollected(receipt);
  const fileName = getPrintFileName(receipt, invoice.customer);
  const whatsAppUrl = getWhatsAppUrl(receipt, invoice);

  return (
    <Drawer labelledBy={headingId} onClose={onClose}>
      <div className={`${styles.chrome} print-hidden`}>
        <header className={styles.header}>
          <div>
            <h2 id={headingId} className={styles.title}>
              Receipt {receipt.number}
            </h2>
            <p className={styles.subtitle}>
              {invoice.customer}, against invoice {invoice.number}
            </p>
          </div>
          <div className={styles.headerEnd}>
            <Badge tone={collected ? BADGE_TONES.SUCCESS : BADGE_TONES.DANGER}>
              {RECEIPT_STATUS_LABELS[receipt.status]}
            </Badge>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Close receipt"
              onClick={onClose}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </header>

        {voidStatus ? (
          <VoidForm
            status={voidStatus}
            receipt={receipt}
            onConfirm={(reason) => {
              onVoid(voidStatus, reason, toIsoDate(today));
              setVoidStatus(null);
            }}
            onBack={() => setVoidStatus(null)}
          />
        ) : (
          <div className={styles.actions}>
            <Button onClick={() => printWithFileName(fileName)}>
              <span aria-hidden="true">⬇ </span>Download PDF
            </Button>
            <Button variant="secondary" onClick={() => printWithFileName(fileName)}>
              Print
            </Button>
            {whatsAppUrl ? (
              <a className={styles.linkButton} href={whatsAppUrl} target="_blank" rel="noreferrer">
                Share on WhatsApp
              </a>
            ) : (
              <Button variant="secondary" disabled title="No 10-digit mobile for this customer">
                Share on WhatsApp
              </Button>
            )}
            <a className={styles.linkButton} href={getMailtoUrl(receipt, invoice)}>
              Email
            </a>
            {collected && receipt.mode !== CASH_MODE && (
              <Button
                variant="secondary"
                className={styles.cancelButton}
                onClick={() => setVoidStatus(RECEIPT_STATUSES.BOUNCED)}
              >
                Mark bounced
              </Button>
            )}
            {collected && (
              <Button
                variant="secondary"
                className={styles.cancelButton}
                onClick={() => setVoidStatus(RECEIPT_STATUSES.CANCELLED)}
              >
                Cancel receipt
              </Button>
            )}
          </div>
        )}
      </div>

      <ReceiptDocument receipt={receipt} invoice={invoice} />
    </Drawer>
  );
}
