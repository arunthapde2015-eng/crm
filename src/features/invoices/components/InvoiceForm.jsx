import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { LineItemsEditor } from '@/components/LineItemsEditor';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { INDIAN_STATES } from '@/constants/states';
import { SALESPERSONS } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';
import { getGst, getTaxable, getTotal } from '@/utils/lineItems';

import { INVOICE_KINDS } from '../constants';
import { parseFormValues, validateFormValues } from '../utils/invoices';
import styles from './Invoices.module.css';

const ADDRESS_ROWS = 3;
const TERMS_ROWS = 2;
const GSTIN_PATTERN = '[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z][Zz][0-9A-Za-z]';
const KIND_OPTIONS = [
  { value: INVOICE_KINDS.SALES, label: 'Sales invoice (INV-)' },
  { value: INVOICE_KINDS.AMC, label: 'AMC invoice (AMC-)' },
];
const SALESPERSON_OPTIONS = [
  { value: '', label: 'Unassigned' },
  ...SALESPERSONS.map((person) => ({ value: person.id, label: person.name })),
];
const STATE_OPTIONS = INDIAN_STATES.map((state) => ({ value: state, label: state }));

/**
 * Create or edit a draft invoice. Remount (via `key`) to load different initial values.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {object} props.initialValues
 * @param {(values: object, shouldIssue: boolean) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function InvoiceForm({ title, initialValues, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const formRef = useRef(null);
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
      id: `invoice-form-${name}`,
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
    };
  }

  function save(shouldIssue) {
    // Two save buttons, so check the browser's field rules here rather than on submit.
    if (!formRef.current.reportValidity()) return;
    const validationErrors = validateFormValues(values);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values, shouldIssue);
  }

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        save(true);
      }}
      aria-labelledby="invoice-form-title"
    >
      <h2 id="invoice-form-title" className={styles.formTitle}>
        {title}
      </h2>

      <div className={styles.grid}>
        <SelectField label="Invoice type" options={KIND_OPTIONS} {...getFieldProps('kind')} />
        <TextField label="Invoice date" type="date" required {...getFieldProps('date')} />
        <TextField
          label="Due date"
          type="date"
          min={values.date}
          required
          {...getFieldProps('dueDate')}
        />
        <SelectField
          label="Salesperson"
          options={SALESPERSON_OPTIONS}
          {...getFieldProps('salespersonId')}
        />
      </div>

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
            title="15 characters, e.g. 27AAATV1111K1Z2"
            {...getFieldProps('customerGstin')}
          />
          <SelectField
            label="Place of supply"
            options={STATE_OPTIONS}
            {...getFieldProps('placeOfSupply')}
          />
        </div>
      </fieldset>

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
      <p className={styles.notice}>
        Issued tax invoices can’t be edited. Corrections are made with credit or debit notes.
      </p>
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => save(false)}>
          Save draft
        </Button>
        <Button type="submit">Issue invoice</Button>
      </div>
    </form>
  );
}
