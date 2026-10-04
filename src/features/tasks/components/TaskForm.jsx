import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { TEAM_MEMBERS } from '@/constants/team';

import { LINK_TARGETS, MAX_TASK_TITLE_LENGTH, TASK_PRIORITY_LABELS } from '../constants';
import styles from './TaskForm.module.css';

const LINK_OPTIONS = [
  { value: '', label: 'Nothing' },
  ...LINK_TARGETS.map((target) => ({ value: target.id, label: target.label })),
];
const ASSIGNEE_OPTIONS = [
  { value: '', label: 'Unassigned' },
  ...TEAM_MEMBERS.map((member) => ({ value: member.id, label: member.name })),
];
const PRIORITY_OPTIONS = Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/**
 * Add or edit a task. Remount (via `key`) to load different initial values.
 *
 * @param {object} props
 * @param {string} props.title - Form heading, also its accessible name.
 * @param {string} props.submitLabel
 * @param {object} props.initialValues
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function TaskForm({ title, submitLabel, initialValues, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const headingId = useId();
  const titleInputRef = useRef(null);

  // The form opens above the table; focusing its first field also scrolls it into view.
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `task-form-${name}`,
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
      <h2 id={headingId} className={styles.heading}>
        {title}
      </h2>
      <div className={styles.grid}>
        <TextField
          ref={titleInputRef}
          label="Task"
          required
          maxLength={MAX_TASK_TITLE_LENGTH}
          className={styles.titleField}
          {...getFieldProps('title')}
        />
        <SelectField label="Linked to" options={LINK_OPTIONS} {...getFieldProps('linkTargetId')} />
        <SelectField
          label="Assigned to"
          options={ASSIGNEE_OPTIONS}
          {...getFieldProps('assigneeId')}
        />
        <SelectField label="Priority" options={PRIORITY_OPTIONS} {...getFieldProps('priority')} />
        <TextField label="Due" type="date" required {...getFieldProps('dueDate')} />
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
