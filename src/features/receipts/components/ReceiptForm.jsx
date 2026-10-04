import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { CASH_MODE, PAYMENT_MODES } from '@/constants/payments';
import { formatCurrency } from '@/utils/formatCurrency';

import { DEPOSIT_ACCOUNTS } from '../constants';
import { getDefaultAccount, getOpenInvoices, validateReceipt } from '../utils/receipts';
import styles from './Receipts.module.css';

const MODE_OPTIONS = PAYMENT_MODES.map((mode) => ({ value: mode, label: mode }));
const ACCOUNT_OPTIONS = DEPOSIT_ACCOUNTS.map((account) => ({ value: account, label: account }));

/**
 * Records money received against an invoice that still has a balance.
 *
 * @param {object} props
 * @param {object} props.initialValues
 * @param {object[]} props.invoices
 * @param {object[]} props.receipts - Existing receipts, for balances and duplicate checks.
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function ReceiptForm({ initialValues, invoices, receipts, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const invoiceRef = useRef(null);
  const openInvoices = getOpenInvoices(invoices, receipts);
  const invoiceOptions = [
    { value: '', label: 'Choose an invoice' },
    ...openInvoices.map((invoice) => ({
      value: invoice.number,
      label: `${invoice.number} · ${invoice.customer} · ${formatCurrency(invoice.balance)} due`,
    })),
  ];

  useEffect(() => {
    invoiceRef.current?.focus();
  }, []);

  function update(changes) {
    setValues((previous) => ({ ...previous, ...changes }));
    setErrors([]);
  }

  function getFieldProps(name) {
    return {
      id: `receipt-form-${name}`,
      name,
      value: values[name],
      onChange: (event) => update({ [name]: event.target.value }),
    };
  }

  function handleInvoiceChange(event) {
    const invoiceNumber = event.target.value;
    const balance = openInvoices.find((invoice) => invoice.number === invoiceNumber)?.balance;
    // Most payments settle the whole balance, so start from that.
    update({ invoiceNumber, amount: balance ? String(balance) : values.amount });
  }

  function handleModeChange(event) {
    const mode = event.target.value;
    update({ mode, account: getDefaultAccount(mode) });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateReceipt(values, invoices, receipts);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="receipt-form-title">
      <h2 id="receipt-form-title" className={styles.formTitle}>
        Record payment
      </h2>
      <div className={styles.grid}>
        <SelectField
          ref={invoiceRef}
          label="Against invoice"
          options={invoiceOptions}
          className={styles.wide}
          {...getFieldProps('invoiceNumber')}
          onChange={handleInvoiceChange}
        />
        <TextField label="Amount (₹)" type="number" min="1" required {...getFieldProps('amount')} />
        <TextField label="Date received" type="date" required {...getFieldProps('date')} />
        <SelectField
          label="Mode"
          options={MODE_OPTIONS}
          {...getFieldProps('mode')}
          onChange={handleModeChange}
        />
        <TextField
          label={
            values.mode === CASH_MODE ? 'Reference (optional)' : 'UTR / transaction / cheque no.'
          }
          {...getFieldProps('reference')}
        />
        <SelectField label="Deposited to" options={ACCOUNT_OPTIONS} {...getFieldProps('account')} />
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
        <Button type="submit">Save receipt</Button>
      </div>
    </form>
  );
}
