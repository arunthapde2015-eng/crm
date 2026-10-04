import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { toIsoDate } from '@/utils/formatDate';

import { NOTE_TYPES, NOTE_TYPE_LABELS } from '../constants';
import { getNoteError } from '../utils/invoices';
import styles from './InvoiceDrawer.module.css';

const TYPE_OPTIONS = Object.entries(NOTE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

/**
 * Raises a credit note (reduces what's owed: returns, discounts, corrections) or a debit note
 * (adds to it: extra charges) against an issued invoice.
 *
 * @param {object} props
 * @param {object} props.invoice
 * @param {Date} props.today
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function NoteForm({ invoice, today, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    type: NOTE_TYPES.CREDIT,
    amount: '',
    date: toIsoDate(today),
    reason: '',
  });
  const [error, setError] = useState('');
  const typeRef = useRef(null);

  useEffect(() => {
    typeRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `note-${name}`,
      name,
      value: values[name],
      onChange: (event) => {
        setValues((previous) => ({ ...previous, [name]: event.target.value }));
        setError('');
      },
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const noteError = getNoteError(invoice, values.type, Number(values.amount));
    if (noteError) {
      setError(noteError);
      return;
    }
    onSubmit(values);
  }

  return (
    <form className={styles.panel} onSubmit={handleSubmit} aria-labelledby="note-form-title">
      <h3 id="note-form-title" className={styles.panelTitle}>
        Credit / debit note against {invoice.number}
      </h3>
      <div className={styles.panelGrid}>
        <SelectField
          ref={typeRef}
          label="Note type"
          options={TYPE_OPTIONS}
          {...getFieldProps('type')}
        />
        <TextField
          label="Amount incl. GST (₹)"
          type="number"
          min="1"
          required
          {...getFieldProps('amount')}
        />
        <TextField label="Note date" type="date" required {...getFieldProps('date')} />
        <TextField label="Reason" required {...getFieldProps('reason')} />
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save note</Button>
      </div>
    </form>
  );
}
