import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';

import { findDuplicateSalesperson } from '../utils/team';
import layout from './SalesLayout.module.css';

const MOBILE_PATTERN = '[0-9]{10}';

/**
 * Add or edit a salesperson. Refuses a mobile or email already used by someone else.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {object} props.initialValues
 * @param {object[]} props.team
 * @param {string | null} props.editingId - The member being edited, excluded from duplicate checks.
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function SalespersonForm({ title, initialValues, team, editingId, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState('');
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `salesperson-form-${name}`,
      name,
      value: values[name],
      onChange: (event) => {
        setValues((previous) => ({ ...previous, [name]: event.target.value }));
        setError('');
      },
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const duplicate = findDuplicateSalesperson(values, team, editingId);
    if (duplicate) {
      setError(`${duplicate.name} already uses this mobile number or email.`);
      return;
    }
    onSubmit(values);
  }

  return (
    <form className={layout.form} onSubmit={handleSubmit} aria-labelledby="salesperson-form-title">
      <h2 id="salesperson-form-title" className={layout.formTitle}>
        {title}
      </h2>
      <div className={layout.formGrid}>
        <TextField ref={nameRef} label="Name" required {...getFieldProps('name')} />
        <TextField
          label="Mobile (10 digits)"
          type="tel"
          inputMode="numeric"
          pattern={MOBILE_PATTERN}
          required
          {...getFieldProps('mobile')}
        />
        <TextField label="Email" type="email" required {...getFieldProps('email')} />
        <TextField label="Territory" {...getFieldProps('territory')} />
        <TextField label="Joining date" type="date" required {...getFieldProps('joinedOn')} />
        <TextField
          label="Monthly target (₹)"
          type="number"
          min="0"
          required
          {...getFieldProps('monthlyTarget')}
        />
      </div>
      {error && (
        <p className={layout.formError} role="alert">
          {error}
        </p>
      )}
      <div className={layout.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
