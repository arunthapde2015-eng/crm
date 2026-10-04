import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';

import styles from './InlineTextForm.module.css';

/**
 * One-field form used for quick additions (an outlet name, a remark). Focuses itself on open.
 *
 * @param {object} props
 * @param {string} props.id - Field id.
 * @param {string} props.label
 * @param {string} props.submitLabel
 * @param {number} [props.rows] - Render a textarea with this many rows.
 * @param {number} [props.maxLength]
 * @param {(value: string) => void} props.onSubmit - Called with the trimmed value.
 * @param {() => void} props.onCancel
 */
export function InlineTextForm({ id, label, submitLabel, rows, maxLength, onSubmit, onCancel }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed === '') return;
    onSubmit(trimmed);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <TextField
        ref={inputRef}
        id={id}
        label={label}
        rows={rows}
        maxLength={maxLength}
        required
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={value.trim() === ''}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
