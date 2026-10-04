import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { CASH_MODE, PAYMENT_MODES } from '@/constants/payments';
import { formatCurrency } from '@/utils/formatCurrency';
import { GST_RATES } from '@/utils/lineItems';

import { EXPENSE_CATEGORIES } from '../constants';
import { getGstAmount, validateExpense } from '../utils/expenses';
import styles from './Expenses.module.css';

const toOptions = (values) => values.map((value) => ({ value, label: value }));
const CATEGORY_OPTIONS = toOptions(EXPENSE_CATEGORIES);
const MODE_OPTIONS = toOptions(PAYMENT_MODES);
const GST_OPTIONS = GST_RATES.map((rate) => ({ value: String(rate), label: `${rate}%` }));

/**
 * Records a bill the company has paid. It is saved as pending until someone approves it.
 *
 * @param {object} props
 * @param {object} props.initialValues
 * @param {object[]} props.expenses - Existing expenses, for duplicate checks.
 * @param {string} props.todayIso
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function ExpenseForm({ initialValues, expenses, todayIso, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const dateRef = useRef(null);
  const amount = Number(values.amount) || 0;
  const gst = getGstAmount(amount, Number(values.gstRate));

  useEffect(() => {
    dateRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `expense-form-${name}`,
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
    const validationErrors = validateExpense(values, expenses, todayIso);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="expense-form-title">
      <h2 id="expense-form-title" className={styles.formTitle}>
        Add expense
      </h2>
      <div className={styles.grid}>
        <TextField ref={dateRef} label="Date" type="date" required {...getFieldProps('date')} />
        <SelectField label="Category" options={CATEGORY_OPTIONS} {...getFieldProps('category')} />
        <TextField label="Vendor" required {...getFieldProps('vendor')} />
        <TextField
          label="Description (optional)"
          placeholder="Defaults to the category"
          {...getFieldProps('description')}
        />
        <TextField
          label="Amount (₹, before GST)"
          type="number"
          min="1"
          required
          {...getFieldProps('amount')}
        />
        <SelectField label="GST rate" options={GST_OPTIONS} {...getFieldProps('gstRate')} />
        <SelectField label="Mode" options={MODE_OPTIONS} {...getFieldProps('mode')} />
        <TextField
          label={values.mode === CASH_MODE ? 'Reference (optional)' : 'UTR / cheque no. (optional)'}
          {...getFieldProps('reference')}
        />
      </div>
      <p className={styles.totals}>
        GST {formatCurrency(gst)}, total paid {formatCurrency(amount + gst)}
      </p>
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
        <Button type="submit">Save expense</Button>
      </div>
    </form>
  );
}
