import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';

import { MERCHANT_STATUS_LABELS } from '../constants';
import styles from './Amc.module.css';

const STATUS_OPTIONS = Object.entries(MERCHANT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/**
 * Picks a new merchant status. On hold and inactive outlets can't be renewed or quoted.
 *
 * @param {object} props
 * @param {string} props.currentStatus
 * @param {(status: string) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function StatusForm({ currentStatus, onSubmit, onCancel }) {
  const [status, setStatus] = useState(currentStatus);
  const selectRef = useRef(null);

  useEffect(() => {
    selectRef.current?.focus();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(status);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Change merchant status">
      <SelectField
        ref={selectRef}
        id="merchant-status"
        label="Merchant status"
        options={STATUS_OPTIONS}
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      />
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={status === currentStatus}>
          Save status
        </Button>
      </div>
    </form>
  );
}
