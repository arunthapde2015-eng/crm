import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';

import { MAX_NOTES_LENGTH } from '../constants';
import { validateEnquiry } from '../utils/callDesk';
import styles from './CallDesk.module.css';

const NOTES_ROWS = 2;

/**
 * Captures a new sales enquiry from a caller. It joins the lead follow-ups, due today.
 *
 * @param {object} props
 * @param {object} props.initialValues
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function EnquiryForm({ initialValues, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `enquiry-form-${name}`,
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
    const validationErrors = validateEnquiry(values);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="enquiry-form-title">
      <h2 id="enquiry-form-title" className={styles.formTitle}>
        New enquiry as lead
      </h2>
      <div className={styles.grid}>
        <TextField ref={nameRef} label="Business or name" required {...getFieldProps('name')} />
        <TextField
          label="Phone"
          type="tel"
          inputMode="numeric"
          required
          {...getFieldProps('phone')}
        />
        <TextField label="Interested in" required {...getFieldProps('product')} />
        <TextField
          label="Estimated value (₹, optional)"
          type="number"
          min="0"
          {...getFieldProps('value')}
        />
      </div>
      <TextField
        label="Notes (optional)"
        rows={NOTES_ROWS}
        maxLength={MAX_NOTES_LENGTH}
        {...getFieldProps('notes')}
      />
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
        <Button type="submit">Save enquiry</Button>
      </div>
    </form>
  );
}
