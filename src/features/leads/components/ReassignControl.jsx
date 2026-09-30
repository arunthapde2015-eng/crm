import { useEffect, useRef } from 'react';

import { Button } from '@/components/Button';
import { SALESPERSONS } from '@/constants/team';

import styles from './ReassignControl.module.css';

const UNASSIGNED_OPTION_VALUE = '';

/**
 * Inline salesperson picker for one lead. Choosing a name applies it immediately.
 *
 * @param {object} props
 * @param {{ id: string, name: string, salespersonId: string | null }} props.lead
 * @param {(salespersonId: string | null) => void} props.onAssign
 * @param {() => void} props.onCancel
 */
export function ReassignControl({ lead, onAssign, onCancel }) {
  const selectRef = useRef(null);
  const selectId = `reassign-${lead.id}`;

  useEffect(() => {
    selectRef.current?.focus();
  }, []);

  function handleChange(event) {
    onAssign(event.target.value || null);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') onCancel();
  }

  return (
    <div className={styles.control}>
      <label htmlFor={selectId} className="visually-hidden">
        Salesperson for {lead.name}
      </label>
      <select
        id={selectId}
        ref={selectRef}
        className={styles.select}
        value={lead.salespersonId ?? UNASSIGNED_OPTION_VALUE}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      >
        <option value={UNASSIGNED_OPTION_VALUE}>Unassigned</option>
        {SALESPERSONS.map((salesperson) => (
          <option key={salesperson.id} value={salesperson.id}>
            {salesperson.name}
          </option>
        ))}
      </select>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
