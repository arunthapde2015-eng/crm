import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { formatCurrency } from '@/utils/formatCurrency';

import { PAYOUT_MODES } from '../constants';
import { getDefaultPayoutDetails } from '../utils/incentives';
import styles from './Incentives.module.css';

/**
 * Confirms paying a salesperson for one or more orders. Amounts are locked once paid.
 *
 * @param {object} props
 * @param {string} props.salespersonName
 * @param {object[]} props.rows - The order incentive rows being paid.
 * @param {Date} props.today
 * @param {(details: { date: string, mode: string, reference: string }) => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
export function PayoutForm({ salespersonName, rows, today, onConfirm, onCancel }) {
  const [details, setDetails] = useState(() => getDefaultPayoutDetails(today));
  const dateRef = useRef(null);
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const orderWord = rows.length === 1 ? 'order' : 'orders';

  useEffect(() => {
    dateRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `payout-${name}`,
      name,
      value: details[name],
      onChange: (event) => setDetails((previous) => ({ ...previous, [name]: event.target.value })),
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    onConfirm(details);
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit} aria-labelledby="payout-form-title">
      <h2 id="payout-form-title" className={styles.cardTitle}>
        Pay {salespersonName} {formatCurrency(total)} for {rows.length} {orderWord}
      </h2>
      <p className={styles.note}>
        {rows.map((row) => `${row.number} (${formatCurrency(row.amount)})`).join(', ')}. Paid
        amounts are locked and won’t change if the rate is edited later.
      </p>
      <div className={styles.formGrid}>
        <TextField
          ref={dateRef}
          label="Payout date"
          type="date"
          required
          {...getFieldProps('date')}
        />
        <SelectField
          label="Paid by"
          options={PAYOUT_MODES.map((mode) => ({ value: mode, label: mode }))}
          {...getFieldProps('mode')}
        />
        <TextField label="Reference" {...getFieldProps('reference')} />
      </div>
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Confirm payout</Button>
      </div>
    </form>
  );
}
