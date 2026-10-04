import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { formatCurrency } from '@/utils/formatCurrency';

import { MIN_VOUCHER_LINES, VOUCHER_TYPE_DETAILS } from '../constants';
import { getAccountOptions } from '../utils/accounts';
import { createEmptyLine, getLineTotals, validateVoucher } from '../utils/vouchers';
import styles from './Accounting.module.css';

const TYPE_OPTIONS = Object.entries(VOUCHER_TYPE_DETAILS).map(([value, { label }]) => ({
  value,
  label,
}));

/**
 * Posts a double-entry voucher. It can only be saved once debits equal credits.
 *
 * @param {object} props
 * @param {object} props.initialValues
 * @param {object[]} props.accounts
 * @param {string} props.todayIso
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function VoucherForm({ initialValues, accounts, todayIso, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const typeRef = useRef(null);
  const totals = getLineTotals(values.lines);
  const difference = totals.debit - totals.credit;
  const accountOptions = [
    { value: '', label: 'Choose an account' },
    ...getAccountOptions(accounts, { onlyActive: true }),
  ];

  useEffect(() => {
    typeRef.current?.focus();
  }, []);

  function update(changes) {
    setValues((previous) => ({ ...previous, ...changes }));
    setErrors([]);
  }

  function getFieldProps(name) {
    return {
      id: `voucher-form-${name}`,
      name,
      value: values[name],
      onChange: (event) => update({ [name]: event.target.value }),
    };
  }

  function updateLine(lineId, changes) {
    update({
      lines: values.lines.map((line) => (line.id === lineId ? { ...line, ...changes } : line)),
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateVoucher(values, accounts, todayIso);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="voucher-form-title">
      <h2 id="voucher-form-title" className={styles.formTitle}>
        New voucher
      </h2>
      <div className={styles.grid}>
        <SelectField ref={typeRef} label="Type" options={TYPE_OPTIONS} {...getFieldProps('type')} />
        <TextField label="Date" type="date" required {...getFieldProps('date')} />
        <TextField label="Narration" required {...getFieldProps('narration')} />
        <TextField label="Reference (optional)" {...getFieldProps('reference')} />
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Lines</legend>
        {values.lines.map((line, index) => {
          const lineNumber = index + 1;
          return (
            <div key={line.id} className={styles.voucherLine}>
              <SelectField
                id={`voucher-line-${line.id}-account`}
                label={`Line ${lineNumber} account`}
                options={accountOptions}
                value={line.accountCode}
                onChange={(event) => updateLine(line.id, { accountCode: event.target.value })}
              />
              <TextField
                id={`voucher-line-${line.id}-debit`}
                label={`Line ${lineNumber} debit (₹)`}
                type="number"
                min="0"
                value={line.debit}
                onChange={(event) => updateLine(line.id, { debit: event.target.value })}
              />
              <TextField
                id={`voucher-line-${line.id}-credit`}
                label={`Line ${lineNumber} credit (₹)`}
                type="number"
                min="0"
                value={line.credit}
                onChange={(event) => updateLine(line.id, { credit: event.target.value })}
              />
              <Button
                variant="ghost"
                aria-label={`Remove line ${lineNumber}`}
                disabled={values.lines.length <= MIN_VOUCHER_LINES}
                onClick={() =>
                  update({ lines: values.lines.filter((item) => item.id !== line.id) })
                }
              >
                ✕
              </Button>
            </div>
          );
        })}
        <div className={styles.lineFooter}>
          <Button
            variant="secondary"
            onClick={() => update({ lines: [...values.lines, createEmptyLine()] })}
          >
            Add line
          </Button>
          <p className={styles.totals} aria-live="polite">
            Debits {formatCurrency(totals.debit)}, credits {formatCurrency(totals.credit)}
            {difference !== 0 && `, difference ${formatCurrency(Math.abs(difference))}`}
          </p>
        </div>
      </fieldset>

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
        <Button type="submit">Post voucher</Button>
      </div>
    </form>
  );
}
