import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { SALESPERSONS } from '@/constants/team';

import { validateProfile } from '../utils/merchantProfile';
import styles from './Amc.module.css';

const ASSIGNEE_OPTIONS = SALESPERSONS.map(({ id, name }) => ({ value: id, label: name }));

/**
 * Edits an outlet's contact details, product and owner.
 *
 * @param {object} props
 * @param {object} props.initialValues
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function ProfileForm({ initialValues, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `profile-form-${name}`,
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
    const validationErrors = validateProfile(values);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="profile-form-title">
      <h3 id="profile-form-title" className={styles.formTitle}>
        Edit merchant details
      </h3>
      <div className={styles.grid}>
        <TextField
          ref={firstFieldRef}
          label="Contact person"
          required
          {...getFieldProps('contactName')}
        />
        <TextField
          label="Mobile"
          type="tel"
          inputMode="numeric"
          required
          {...getFieldProps('mobile')}
        />
        <TextField label="Email" type="email" {...getFieldProps('email')} />
        <TextField label="Address" required {...getFieldProps('address')} />
        <TextField label="Product / service" required {...getFieldProps('product')} />
        <SelectField
          label="Assigned to"
          options={ASSIGNEE_OPTIONS}
          {...getFieldProps('assignedTo')}
        />
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
        <Button type="submit">Save details</Button>
      </div>
    </form>
  );
}
