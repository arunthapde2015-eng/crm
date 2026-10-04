import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { LineItemsEditor } from '@/components/LineItemsEditor';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { INDIAN_STATES } from '@/constants/states';
import { SALESPERSONS } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';

import { APPROVAL_DISCOUNT_PERCENT, APPROVAL_STATUSES } from '../constants';
import {
  getDiscountAmount,
  getGst,
  getTaxable,
  getTotal,
  parseFormValues,
  validateFormValues,
} from '../utils/quotations';

import { SectionsEditor } from './SectionsEditor';
import styles from './QuotationForm.module.css';

const TERMS_ROWS = 3;
const SALESPERSON_OPTIONS = [
  { value: '', label: 'Unassigned' },
  ...SALESPERSONS.map((person) => ({ value: person.id, label: person.name })),
];
const STATE_OPTIONS = INDIAN_STATES.map((state) => ({ value: state, label: state }));

/**
 * Create, edit or revise a quotation. Remount (via `key`) to load different initial values.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.submitLabel
 * @param {object} props.initialValues
 * @param {string} [props.revisionNote] - Shown when saving will create a new revision.
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function QuotationForm({
  title,
  submitLabel,
  initialValues,
  revisionNote,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const customerRef = useRef(null);
  const preview = parseFormValues(values);

  useEffect(() => {
    customerRef.current?.focus();
  }, []);

  function setField(name, value) {
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  function getFieldProps(name) {
    return {
      id: `quotation-form-${name}`,
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
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="quotation-form-title">
      <h2 id="quotation-form-title" className={styles.title}>
        {title}
      </h2>
      {revisionNote && <p className={styles.notice}>{revisionNote}</p>}

      <div className={styles.grid}>
        <TextField
          ref={customerRef}
          label="Customer / merchant"
          required
          className={styles.wide}
          {...getFieldProps('customer')}
        />
        <SelectField
          label="Salesperson"
          options={SALESPERSON_OPTIONS}
          {...getFieldProps('salespersonId')}
        />
        <SelectField
          label="Place of supply"
          options={STATE_OPTIONS}
          {...getFieldProps('placeOfSupply')}
        />
        <TextField label="Date" type="date" required {...getFieldProps('date')} />
        <TextField
          label="Valid until"
          type="date"
          min={values.date}
          required
          {...getFieldProps('validUntil')}
        />
        <TextField
          label="Discount (%)"
          type="number"
          min="0"
          max="100"
          step="0.5"
          {...getFieldProps('discountPercent')}
        />
      </div>

      <LineItemsEditor items={values.items} onChange={(items) => setField('items', items)} />

      <dl className={styles.totals} aria-live="polite">
        <div>
          <dt>Discount</dt>
          <dd>{formatCurrency(getDiscountAmount(preview))}</dd>
        </div>
        <div>
          <dt>Taxable</dt>
          <dd>{formatCurrency(getTaxable(preview))}</dd>
        </div>
        <div>
          <dt>GST</dt>
          <dd>{formatCurrency(getGst(preview))}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd className={styles.grandTotal}>{formatCurrency(getTotal(preview))}</dd>
        </div>
      </dl>
      {preview.approval === APPROVAL_STATUSES.PENDING && (
        <p className={styles.notice}>
          A discount of {APPROVAL_DISCOUNT_PERCENT}% or more needs approval before this can be sent.
        </p>
      )}

      <SectionsEditor
        sections={values.sections}
        onChange={(sections) => setField('sections', sections)}
      />
      <TextField label="Terms & conditions" rows={TERMS_ROWS} {...getFieldProps('terms')} />

      {errors.length > 0 && (
        <ul className={styles.errors} role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
