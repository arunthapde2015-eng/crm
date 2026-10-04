import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { CASH_MODE, PAYMENT_MODES } from '@/constants/payments';
import { formatCurrency } from '@/utils/formatCurrency';

import { getBillTotal, validatePayment } from '../utils/purchases';
import styles from './Purchases.module.css';

const MODE_OPTIONS = PAYMENT_MODES.map((mode) => ({ value: mode, label: mode }));

/**
 * Records paying a vendor bill in full.
 *
 * @param {object} props
 * @param {object} props.bill
 * @param {string} props.vendorName
 * @param {object} props.initialValues
 * @param {object[]} props.bills - All bills, so a payment reference isn't used twice.
 * @param {string} props.todayIso
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function PayVendorForm({
  bill,
  vendorName,
  initialValues,
  bills,
  todayIso,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const dateRef = useRef(null);
  const title = `Pay ${vendorName} for ${bill.number}`;

  useEffect(() => {
    dateRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `pay-vendor-${name}`,
      name,
      value: values[name],
      onChange: (event) => {
        setValues((previous) => ({ ...previous, [name]: event.target.value }));
        setErrors([]);
      },
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validatePayment(values, bill, bills, todayIso);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label={title}>
      <h2 className={styles.formTitle}>{title}</h2>
      <p className={styles.formNote}>
        Bill {bill.vendorBillNumber}, {bill.description}. Paying the full{' '}
        {formatCurrency(getBillTotal(bill))}.
      </p>
      <div className={styles.grid}>
        <TextField ref={dateRef} label="Paid on" type="date" required {...getFieldProps('date')} />
        <SelectField label="Mode" options={MODE_OPTIONS} {...getFieldProps('mode')} />
        <TextField
          label={
            values.mode === CASH_MODE ? 'Reference (optional)' : 'UTR / transaction / cheque no.'
          }
          {...getFieldProps('reference')}
        />
      </div>
      {errors.length > 0 && (
        <ul className={styles.errors} role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save payment</Button>
      </div>
    </form>
  );
}
