import { DocumentPaper } from '@/components/GstDocument';
import { COMPANY } from '@/constants/company';
import { CHEQUE_MODE } from '@/constants/payments';
import { amountInWords } from '@/utils/amountInWords';
import { formatTwoDecimals } from '@/utils/formatCurrency';
import { formatDocumentDate, parseIsoDate } from '@/utils/formatDate';

import { RECEIPT_STATUS_LABELS } from '../constants';
import { isCollected } from '../utils/receipts';
import styles from './ReceiptDocument.module.css';

function formatDate(isoDate) {
  return formatDocumentDate(parseIsoDate(isoDate));
}

/**
 * A payment receipt on the company letterhead. Bounced or cancelled receipts carry a stamp so a
 * reprint can't be mistaken for a valid one.
 *
 * @param {object} props
 * @param {object} props.receipt
 * @param {object} props.invoice - The invoice it was received against.
 */
export function ReceiptDocument({ receipt, invoice }) {
  const isValid = isCollected(receipt);
  const rows = [
    ['Received from', <strong key="from">{invoice.customer}</strong>],
    ['Against invoice', invoice.number],
    ['Payment mode', receipt.mode],
    ['Reference / UTR', receipt.reference],
    ['Deposited to', receipt.account],
  ].filter(([, value]) => value);

  return (
    <DocumentPaper
      label={`Receipt document ${receipt.number}`}
      title="Payment Receipt"
      notice={
        receipt.mode === CHEQUE_MODE ? 'Cheque payments are subject to realisation.' : undefined
      }
    >
      {!isValid && (
        <p className={styles.stamp}>
          {RECEIPT_STATUS_LABELS[receipt.status]}
          {receipt.voidReason && `: ${receipt.voidReason}`}
        </p>
      )}
      <div className={styles.meta}>
        <span>
          Receipt No. <strong>{receipt.number}</strong>
        </span>
        <span>
          Date: <strong>{formatDate(receipt.date)}</strong>
        </span>
      </div>
      <dl className={styles.details}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.amountBox}>
        <p className={styles.amountLabel}>Amount received</p>
        <p className={styles.amount}>₹{formatTwoDecimals(receipt.amount)}</p>
        <p className={styles.words}>{amountInWords(receipt.amount)}</p>
      </div>
      <div className={styles.signature}>
        <p>
          For <strong>{COMPANY.legalName.toUpperCase()}</strong>
        </p>
        <p className={styles.signatureLine}>Authorised Signatory</p>
      </div>
    </DocumentPaper>
  );
}
