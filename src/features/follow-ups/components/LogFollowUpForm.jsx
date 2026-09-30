import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';

import { FOLLOW_UP_TYPE_LABELS } from '../constants';
import styles from './LogFollowUpForm.module.css';

const TYPE_OPTIONS = Object.entries(FOLLOW_UP_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/**
 * Records the outcome of a follow-up and schedules the next one.
 *
 * @param {object} props
 * @param {object} props.followUp
 * @param {string} props.defaultNextDate - ISO date prefilled for the next follow-up.
 * @param {(log: { type: string, discussion: string, nextDate: string, nextTime: string }) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function LogFollowUpForm({ followUp, defaultNextDate, onSubmit, onCancel }) {
  const [log, setLog] = useState({
    type: followUp.type,
    discussion: '',
    nextDate: defaultNextDate,
    nextTime: followUp.dueTime,
  });
  const discussionRef = useRef(null);
  const idPrefix = `log-${followUp.id}`;

  useEffect(() => {
    discussionRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `${idPrefix}-${name}`,
      name,
      value: log[name],
      onChange: (event) => setLog((previous) => ({ ...previous, [name]: event.target.value })),
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(log);
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      aria-label={`Log follow-up for ${followUp.leadName}`}
    >
      <TextField
        ref={discussionRef}
        label="What was discussed"
        required
        className={styles.discussion}
        {...getFieldProps('discussion')}
      />
      <SelectField label="Type" options={TYPE_OPTIONS} {...getFieldProps('type')} />
      <TextField label="Next follow-up" type="date" required {...getFieldProps('nextDate')} />
      <TextField label="Time" type="time" required {...getFieldProps('nextTime')} />
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
