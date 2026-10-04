import { useId, useState } from 'react';

import { BADGE_TONES, Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { Drawer } from '@/components/Drawer';
import { TextField } from '@/components/TextField';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { MAX_REASON_LENGTH, VOUCHER_STATUSES, VOUCHER_TYPE_DETAILS } from '../constants';
import { findAccount } from '../utils/accounts';
import { getVoucherTotal } from '../utils/vouchers';
import styles from './Accounting.module.css';

const REASON_ROWS = 2;
const formatAmount = (amount) => (amount > 0 ? formatCurrency(amount) : '');

function CancelForm({ onSubmit, onKeep }) {
  const [reason, setReason] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (reason.trim() !== '') onSubmit(reason);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Cancel this voucher?">
      <p className={styles.formNote}>
        The voucher stays on record but is left out of every balance and report.
      </p>
      <TextField
        id="voucher-cancel-reason"
        label="Reason"
        rows={REASON_ROWS}
        maxLength={MAX_REASON_LENGTH}
        required
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onKeep}>
          Keep voucher
        </Button>
        <Button type="submit" disabled={reason.trim() === ''}>
          Cancel voucher
        </Button>
      </div>
    </form>
  );
}

/**
 * One voucher's lines, with the option to cancel it.
 *
 * @param {object} props
 * @param {object} props.voucher
 * @param {object[]} props.accounts
 * @param {(reason: string) => void} props.onCancelVoucher
 * @param {() => void} props.onClose
 */
export function VoucherDrawer({ voucher, accounts, onCancelVoucher, onClose }) {
  const headingId = useId();
  const [isCancelling, setIsCancelling] = useState(false);
  const isPosted = voucher.status === VOUCHER_STATUSES.POSTED;
  const total = getVoucherTotal(voucher);

  return (
    <Drawer labelledBy={headingId} onClose={onClose}>
      <header className={styles.drawerHeader}>
        <div>
          <h2 id={headingId} className={styles.drawerTitle}>
            {VOUCHER_TYPE_DETAILS[voucher.type].label} voucher {voucher.number}
          </h2>
          <p className={styles.drawerSubtitle}>
            {formatDayMonthYear(parseIsoDate(voucher.date))}
            {voucher.reference && `, ref. ${voucher.reference}`}
          </p>
        </div>
        <div className={styles.drawerHeaderEnd}>
          <Badge tone={isPosted ? BADGE_TONES.SUCCESS : BADGE_TONES.DANGER}>
            {isPosted ? 'Posted' : 'Cancelled'}
          </Badge>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close voucher"
            onClick={onClose}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </header>

      <div className={styles.stack}>
        <p className={styles.narration}>{voucher.narration}</p>
        {!isPosted && <p className={styles.cancelNote}>Cancelled: {voucher.cancelReason}</p>}

        <DataTable caption={`Lines of ${voucher.number}`}>
          <thead>
            <tr>
              <th scope="col">Account</th>
              <th scope="col" className={styles.numeric}>
                Debit
              </th>
              <th scope="col" className={styles.numeric}>
                Credit
              </th>
            </tr>
          </thead>
          <tbody>
            {voucher.lines.map((line, index) => (
              // A voucher's lines never change once posted, so their order is a stable key.
              <tr key={`${line.accountCode}-${index}`}>
                <th scope="row">
                  {findAccount(accounts, line.accountCode)?.name ?? line.accountCode}
                  <span className={styles.subtext}>{line.accountCode}</span>
                </th>
                <td className={styles.numeric}>{formatAmount(line.debit)}</td>
                <td className={styles.numeric}>{formatAmount(line.credit)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td className={styles.numeric}>{formatCurrency(total)}</td>
              <td className={styles.numeric}>{formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </DataTable>

        {isPosted && !isCancelling && (
          <div>
            <Button variant="secondary" onClick={() => setIsCancelling(true)}>
              Cancel voucher
            </Button>
          </div>
        )}
        {isPosted && isCancelling && (
          <CancelForm
            onSubmit={(reason) => {
              onCancelVoucher(reason);
              setIsCancelling(false);
            }}
            onKeep={() => setIsCancelling(false)}
          />
        )}
      </div>
    </Drawer>
  );
}
