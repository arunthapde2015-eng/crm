import { useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { SALESPERSONS } from '@/constants/team';

import styles from './BulkAssignBar.module.css';

const SALESPERSON_OPTIONS = SALESPERSONS.map((salesperson) => ({
  value: salesperson.id,
  label: salesperson.name,
}));

/**
 * Shown while leads are ticked: assigns them all to one salesperson.
 *
 * @param {object} props
 * @param {number} props.selectedCount
 * @param {(salespersonId: string) => void} props.onAssign
 * @param {() => void} props.onClear
 */
export function BulkAssignBar({ selectedCount, onAssign, onClear }) {
  const [salespersonId, setSalespersonId] = useState(SALESPERSONS[0].id);

  function handleSubmit(event) {
    event.preventDefault();
    onAssign(salespersonId);
  }

  return (
    <form className={styles.bar} onSubmit={handleSubmit} aria-label="Bulk assign">
      <p className={styles.count}>{selectedCount} selected</p>
      <SelectField
        id="bulk-assign-salesperson"
        label="Assign to"
        isLabelHidden
        options={SALESPERSON_OPTIONS}
        value={salespersonId}
        onChange={(event) => setSalespersonId(event.target.value)}
      />
      <Button type="submit">Assign selected</Button>
      <Button variant="secondary" onClick={onClear}>
        Clear selection
      </Button>
    </form>
  );
}
