import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { BANK_ACCOUNT_TYPES, BOOKS_START_DATE } from '../constants';
import { validateBank } from '../utils/banks';
import styles from './Accounting.module.css';

const TYPE_OPTIONS = BANK_ACCOUNT_TYPES.map((type) => ({ value: type, label: type }));

/**
 * Adds a bank account. It becomes a ledger account that vouchers can pay into or out of.
 *
 * @param {object} props
 * @param {object} props.initialValues
 * @param {object[]} props.banks - Existing banks, so names and numbers aren't repeated.
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function BankForm({ initialValues, banks, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `bank-form-${name}`,
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
    const validationErrors = validateBank(values, banks);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="bank-form-title">
      <h2 id="bank-form-title" className={styles.formTitle}>
        Add bank account
      </h2>
      <div className={styles.grid}>
        <TextField ref={nameRef} label="Account name" required {...getFieldProps('name')} />
        <TextField label="Bank" required {...getFieldProps('bankName')} />
        <TextField
          label="Account number"
          inputMode="numeric"
          required
          {...getFieldProps('accountNumber')}
        />
        <TextField label="IFSC" required {...getFieldProps('ifsc')} />
        <TextField label="Branch" {...getFieldProps('branch')} />
        <SelectField
          label="Account type"
          options={TYPE_OPTIONS}
          {...getFieldProps('accountType')}
        />
        <TextField
          label="Opening balance (₹)"
          type="number"
          required
          {...getFieldProps('openingBalance')}
        />
      </div>
      <p className={styles.formNote}>
        The opening balance is as at the start of the books,{' '}
        {formatDayMonthYear(parseIsoDate(BOOKS_START_DATE))}.
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
        <Button type="submit">Save bank account</Button>
      </div>
    </form>
  );
}
