import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { SALESPERSONS } from '@/constants/team';

import {
  MERCHANT_TYPE_LABELS,
  GSTIN_PATTERN,
  INDIAN_STATES,
  MOBILE_NUMBER_PATTERN,
} from '../constants';
import styles from './MerchantForm.module.css';

const TYPE_OPTIONS = Object.entries(MERCHANT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const STATE_OPTIONS = INDIAN_STATES.map((state) => ({ value: state, label: state }));
const OWNER_OPTIONS = [
  { value: '', label: 'Unassigned' },
  ...SALESPERSONS.map((salesperson) => ({ value: salesperson.id, label: salesperson.name })),
];

/**
 * Add, edit or copy a merchant. Remount (via `key`) to load different initial values.
 *
 * @param {object} props
 * @param {string} props.title - Form heading, also its accessible name.
 * @param {string} props.submitLabel
 * @param {object} props.initialValues
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function MerchantForm({ title, submitLabel, initialValues, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const headingId = useId();
  const nameInputRef = useRef(null);

  // The form opens above the table, possibly off-screen from the row that opened it;
  // focusing its first field also scrolls it into view.
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `merchant-form-${name}`,
      name,
      value: values[name],
      onChange: (event) => setValues((previous) => ({ ...previous, [name]: event.target.value })),
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        {title}
      </h2>
      <div className={styles.grid}>
        <TextField ref={nameInputRef} label="Merchant name" required {...getFieldProps('name')} />
        <TextField label="Contact person" {...getFieldProps('contactName')} />
        <TextField
          label="Mobile (10 digits)"
          type="tel"
          inputMode="numeric"
          pattern={MOBILE_NUMBER_PATTERN}
          required
          {...getFieldProps('mobile')}
        />
        <SelectField label="Type" options={TYPE_OPTIONS} {...getFieldProps('type')} />
        <TextField
          label="GSTIN (optional)"
          pattern={GSTIN_PATTERN}
          title="15 characters, e.g. 27AAAAN3333M1Z4"
          autoCapitalize="characters"
          {...getFieldProps('gstin')}
        />
        <SelectField label="State" options={STATE_OPTIONS} {...getFieldProps('state')} />
        <SelectField label="Executive" options={OWNER_OPTIONS} {...getFieldProps('ownerId')} />
      </div>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
