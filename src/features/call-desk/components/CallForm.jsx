import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { formatMobile, getTelHref } from '@/utils/formatPhone';

import {
  CALL_DIRECTIONS,
  CALL_OUTCOMES,
  CALL_OUTCOME_LABELS,
  MAX_NOTES_LENGTH,
} from '../constants';
import { needsCallback, validateCall } from '../utils/callDesk';
import styles from './CallDesk.module.css';

const toOptions = (entries) => entries.map(([value, label]) => ({ value, label }));
const OUTCOME_OPTIONS = toOptions(Object.entries(CALL_OUTCOME_LABELS));
const DIRECTION_OPTIONS = Object.values(CALL_DIRECTIONS).map((value) => ({ value, label: value }));
const NOTES_ROWS = 2;

/**
 * Logs one call, either for a queued contact (name and number fixed) or an ad-hoc call.
 *
 * @param {object} props
 * @param {object | null} props.item - The queued contact being called, or null for an ad-hoc call.
 * @param {object} props.initialValues
 * @param {string} props.todayIso
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function CallForm({ item, initialValues, todayIso, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const firstFieldRef = useRef(null);
  const title = item ? `Log call: ${item.name}` : 'Log a call';
  const isRetry = needsCallback(values.outcome);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `call-form-${name}`,
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
    const validationErrors = validateCall(values, todayIso);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label={title}>
      <h2 className={styles.formTitle}>{title}</h2>
      {item && (
        <p className={styles.formNote}>
          <a className={styles.link} href={getTelHref(item.phone)}>
            {formatMobile(item.phone)}
          </a>
          , {item.kind.toLowerCase()}
        </p>
      )}
      <div className={styles.grid}>
        {!item && (
          <>
            <TextField ref={firstFieldRef} label="Name" required {...getFieldProps('name')} />
            <TextField
              label="Phone"
              type="tel"
              inputMode="numeric"
              required
              {...getFieldProps('phone')}
            />
          </>
        )}
        <SelectField
          ref={item ? firstFieldRef : undefined}
          label="Outcome"
          options={OUTCOME_OPTIONS}
          {...getFieldProps('outcome')}
        />
        <SelectField
          label="Direction"
          options={DIRECTION_OPTIONS}
          {...getFieldProps('direction')}
        />
        {isRetry && (
          <TextField
            label={values.outcome === CALL_OUTCOMES.CALL_BACK ? 'Call back on' : 'Try again on'}
            type="date"
            required
            {...getFieldProps('callbackDate')}
          />
        )}
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
        <Button type="submit">Save call</Button>
      </div>
    </form>
  );
}
