import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { LineItemsEditor } from '@/components/LineItemsEditor';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { INDIAN_STATES } from '@/constants/states';
import { SALESPERSONS } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';
import { getGst, getTaxable, getTotal } from '@/utils/lineItems';

import { parseFormValues, validateFormValues } from '../utils/proformas';
import styles from './Proformas.module.css';

const ADDRESS_ROWS = 3;
const TERMS_ROWS = 2;
const GSTIN_PATTERN = '[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z][Zz][0-9A-Za-z]';
const SALESPERSON_OPTIONS = [
  { value: '', label: 'Unassigned' },
  ...SALESPERSONS.map((person) => ({ value: person.id, label: person.name })),
];
const STATE_OPTIONS = INDIAN_STATES.map((state) => ({ value: state, label: state }));

/**
 * Issue or revise a proforma. Remount (via `key`) to load different initial values.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.submitLabel
 * @param {object} props.initialValues
 * @param {string} [props.revisionNote]
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function ProformaForm({
  title,
  submitLabel,
  initialValues,
  revisionNote,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const nameRef = useRef(null);
  const preview = parseFormValues(values);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function setField(name, value) {
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  function getFieldProps(name) {
    return {
      id: `proforma-form-${name}`,
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateFormValues(values);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="proforma-form-title">
      <h2 id="proforma-form-title" className={styles.formTitle}>
        {title}
      </h2>
      {revisionNote && <p className={styles.notice}>{revisionNote}</p>}

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Customer detail</legend>
        <div className={styles.grid}>
          <TextField
            ref={nameRef}
            label="Customer / merchant (M/S)"
            required
            className={styles.wide}
            {...getFieldProps('customerName')}
          />
          <TextField
            label="Phone"
            type="tel"
            inputMode="numeric"
            {...getFieldProps('customerPhone')}
          />
          <TextField label="Email" type="email" {...getFieldProps('customerEmail')} />
          <TextField
            label="Address"
            rows={ADDRESS_ROWS}
            className={styles.wide}
            {...getFieldProps('customerAddress')}
          />
          <TextField
            label="GSTIN (optional)"
            pattern={GSTIN_PATTERN}
            title="15 characters, e.g. 27AAEAM3823E1ZT"
            {...getFieldProps('customerGstin')}
          />
          <SelectField
            label="Place of supply"
            options={STATE_OPTIONS}
            {...getFieldProps('placeOfSupply')}
          />
        </div>
      </fieldset>

      <div className={styles.grid}>
        <TextField label="Proforma date" type="date" required {...getFieldProps('date')} />
        <TextField
          label="Valid till"
          type="date"
          min={values.date}
          required
          {...getFieldProps('validTill')}
        />
        <TextField label="Quotation ref. (optional)" {...getFieldProps('quotationRef')} />
        <SelectField
          label="Salesperson"
          options={SALESPERSON_OPTIONS}
          {...getFieldProps('salespersonId')}
        />
      </div>

      <LineItemsEditor
        items={values.items}
        onChange={(items) => setField('items', items)}
        showHsn
      />
      <p className={styles.totals} aria-live="polite">
        Taxable {formatCurrency(getTaxable(preview))} + GST {formatCurrency(getGst(preview))} ={' '}
        <strong>{formatCurrency(getTotal(preview))}</strong>
      </p>

      <TextField label="Terms and conditions" rows={TERMS_ROWS} {...getFieldProps('terms')} />

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
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
