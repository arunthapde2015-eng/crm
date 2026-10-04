import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { getCurrentPeriod, getPeriodEnd, validateRenewal } from '../utils/amc';
import styles from './Amc.module.css';

const formatDate = (isoDate) => formatDayMonthYear(parseIsoDate(isoDate));

/**
 * Raises next year's AMC invoice for one merchant outlet.
 *
 * @param {object} props
 * @param {object} props.contract
 * @param {object} props.initialValues - `{ amount, start }`.
 * @param {string} props.todayIso
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function RenewalForm({ contract, initialValues, todayIso, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const amountRef = useRef(null);
  const current = getCurrentPeriod(contract, todayIso);
  const titleId = `renewal-form-title-${contract.id}`;

  useEffect(() => {
    amountRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `renewal-form-${name}`,
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
    const validationErrors = validateRenewal(values, contract, todayIso);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.formTitle}>
        Renew AMC: {contract.merchantName}
      </h2>
      <p className={styles.formNote}>
        Current AMC {formatDate(current.start)} to {formatDate(current.end)},{' '}
        {formatCurrency(current.amount)}. The renewal invoice is raised today and shows as pending
        until it is paid.
      </p>
      <div className={styles.grid}>
        <TextField
          ref={amountRef}
          label="Amount (₹, before GST)"
          type="number"
          min="1"
          required
          {...getFieldProps('amount')}
        />
        <TextField label="Starts on" type="date" required {...getFieldProps('start')} />
        {values.start !== '' && (
          <p className={styles.formNote}>Runs to {formatDate(getPeriodEnd(values.start))}.</p>
        )}
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
        <Button type="submit">Create renewal invoice</Button>
      </div>
    </form>
  );
}
