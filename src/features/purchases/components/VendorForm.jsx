import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { INDIAN_STATES } from '@/constants/states';

import { validateVendor } from '../utils/purchases';
import styles from './Purchases.module.css';

const STATE_OPTIONS = INDIAN_STATES.map((state) => ({ value: state, label: state }));

/**
 * Adds a supplier that purchase bills can be entered against.
 *
 * @param {object} props
 * @param {object} props.initialValues
 * @param {object[]} props.vendors - Existing vendors, so names aren't repeated.
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function VendorForm({ initialValues, vendors, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `vendor-form-${name}`,
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
    const validationErrors = validateVendor(values, vendors);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="vendor-form-title">
      <h2 id="vendor-form-title" className={styles.formTitle}>
        Add vendor
      </h2>
      <div className={styles.grid}>
        <TextField ref={nameRef} label="Vendor name" required {...getFieldProps('name')} />
        <TextField label="GSTIN (optional)" {...getFieldProps('gstin')} />
        <SelectField label="State" options={STATE_OPTIONS} {...getFieldProps('state')} />
        <TextField label="Contact person" {...getFieldProps('contactName')} />
        <TextField label="Mobile" type="tel" inputMode="numeric" {...getFieldProps('mobile')} />
        <TextField label="Email" type="email" {...getFieldProps('email')} />
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
        <Button type="submit">Save vendor</Button>
      </div>
    </form>
  );
}
