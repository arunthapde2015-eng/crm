import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { formatCurrency } from '@/utils/formatCurrency';

import { MAX_REASON_LENGTH } from '../constants';
import styles from './Expenses.module.css';

const REASON_ROWS = 2;

/**
 * Asks why an expense is being rejected. The expense stays on record with the reason.
 *
 * @param {object} props
 * @param {object} props.expense
 * @param {(reason: string) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function RejectForm({ expense, onSubmit, onCancel }) {
  const [reason, setReason] = useState('');
  const reasonRef = useRef(null);
  const title = `Reject ${expense.number}?`;

  useEffect(() => {
    reasonRef.current?.focus();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    if (reason.trim() !== '') onSubmit(reason);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label={title}>
      <h2 className={styles.formTitle}>{title}</h2>
      <p className={styles.formNote}>
        {expense.vendor}, {expense.description}, {formatCurrency(expense.amount)}. It stays on
        record but won’t count towards spend.
      </p>
      <TextField
        ref={reasonRef}
        id="expense-reject-reason"
        label="Reason"
        rows={REASON_ROWS}
        maxLength={MAX_REASON_LENGTH}
        required
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          Keep pending
        </Button>
        <Button type="submit" disabled={reason.trim() === ''}>
          Reject expense
        </Button>
      </div>
    </form>
  );
}
