import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { MAX_TEXT_LENGTH, PRIORITY_LABELS, TICKET_CATEGORIES } from '../constants';
import { getDueDate, validateTicket } from '../utils/tickets';
import { ASSIGNEE_OPTIONS } from './ticketOptions';
import styles from './Tickets.module.css';

const CATEGORY_OPTIONS = TICKET_CATEGORIES.map((category) => ({
  value: category,
  label: category,
}));
const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const DESCRIPTION_ROWS = 3;

/**
 * Raises a support ticket. Its due date follows from the priority.
 *
 * @param {object} props
 * @param {object} props.initialValues
 * @param {string} props.todayIso
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function TicketForm({ initialValues, todayIso, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const customerRef = useRef(null);

  useEffect(() => {
    customerRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `ticket-form-${name}`,
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
    const validationErrors = validateTicket(values);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="ticket-form-title">
      <h2 id="ticket-form-title" className={styles.formTitle}>
        Raise ticket
      </h2>
      <div className={styles.grid}>
        <TextField
          ref={customerRef}
          label="Merchant or customer"
          required
          {...getFieldProps('customer')}
        />
        <TextField
          label="Phone (optional)"
          type="tel"
          inputMode="numeric"
          {...getFieldProps('phone')}
        />
        <TextField label="Subject" required className={styles.wide} {...getFieldProps('subject')} />
        <SelectField label="Category" options={CATEGORY_OPTIONS} {...getFieldProps('category')} />
        <SelectField label="Priority" options={PRIORITY_OPTIONS} {...getFieldProps('priority')} />
        <SelectField
          label="Assign to"
          options={ASSIGNEE_OPTIONS}
          {...getFieldProps('assigneeId')}
        />
      </div>
      <TextField
        label="Description"
        rows={DESCRIPTION_ROWS}
        maxLength={MAX_TEXT_LENGTH}
        required
        {...getFieldProps('description')}
      />
      <p className={styles.formNote}>
        Due {formatDayMonthYear(parseIsoDate(getDueDate(todayIso, values.priority)))}, based on the
        priority.
      </p>
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
        <Button type="submit">Save ticket</Button>
      </div>
    </form>
  );
}
