import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { formatCurrency } from '@/utils/formatCurrency';
import { toIsoDate } from '@/utils/formatDate';

import { PAYMENT_MODES } from '../constants';
import { getBalance, getPaymentError } from '../utils/invoices';
import styles from './InvoiceDrawer.module.css';

/**
 * @param {object} props
 * @param {object} props.invoice
 * @param {Date} props.today
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function RecordPaymentForm({ invoice, today, onSubmit, onCancel }) {
  const balance = getBalance(invoice);
  const [values, setValues] = useState({
    amount: String(balance),
    date: toIsoDate(today),
    mode: PAYMENT_MODES[0],
    reference: '',
  });
  const [error, setError] = useState('');
  const amountRef = useRef(null);

  useEffect(() => {
    amountRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `payment-${name}`,
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
    const paymentError = getPaymentError(invoice, Number(values.amount));
    if (paymentError) {
      setError(paymentError);
      return;
    }
    onSubmit(values);
  }

  return (
    <form className={styles.panel} onSubmit={handleSubmit} aria-labelledby="payment-form-title">
      <h3 id="payment-form-title" className={styles.panelTitle}>
        Record payment (balance {formatCurrency(balance)})
      </h3>
      <div className={styles.panelGrid}>
        <TextField
          ref={amountRef}
          label="Amount (₹)"
          type="number"
          min="1"
          required
          {...getFieldProps('amount')}
        />
        <TextField label="Payment date" type="date" required {...getFieldProps('date')} />
        <SelectField
          label="Mode"
          options={PAYMENT_MODES.map((mode) => ({ value: mode, label: mode }))}
          {...getFieldProps('mode')}
        />
        <TextField label="Reference" {...getFieldProps('reference')} />
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
        <Button type="submit">Save payment</Button>
      </div>
    </form>
  );
}
