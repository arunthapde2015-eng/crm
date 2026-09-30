import { useId, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { SALESPERSONS } from '@/constants/team';

import {
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  LEAD_SOURCES,
  MOBILE_NUMBER_PATTERN,
} from '../constants';
import styles from './AddLeadForm.module.css';

const EMPTY_VALUES = {
  name: '',
  contactName: '',
  mobile: '',
  source: LEAD_SOURCES[0],
  product: '',
  value: '',
  priority: LEAD_PRIORITIES.MEDIUM,
  salespersonId: '',
};

const SOURCE_OPTIONS = LEAD_SOURCES.map((source) => ({ value: source, label: source }));
const PRIORITY_OPTIONS = Object.entries(LEAD_PRIORITY_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const SALESPERSON_OPTIONS = [
  { value: '', label: 'Unassigned' },
  ...SALESPERSONS.map((salesperson) => ({ value: salesperson.id, label: salesperson.name })),
];

/**
 * @param {object} props
 * @param {(values: typeof EMPTY_VALUES) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function AddLeadForm({ onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const headingId = useId();

  function getFieldProps(name) {
    return {
      id: `new-lead-${name}`,
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
      <h2 id={headingId} className={styles.title}>
        New lead
      </h2>
      <div className={styles.grid}>
        <TextField label="Lead / organisation name" required {...getFieldProps('name')} />
        <TextField label="Contact person" required {...getFieldProps('contactName')} />
        <TextField
          label="Mobile (10 digits)"
          type="tel"
          inputMode="numeric"
          pattern={MOBILE_NUMBER_PATTERN}
          required
          {...getFieldProps('mobile')}
        />
        <SelectField label="Source" options={SOURCE_OPTIONS} {...getFieldProps('source')} />
        <TextField label="Product" {...getFieldProps('product')} />
        <TextField label="Value (₹)" type="number" min="0" {...getFieldProps('value')} />
        <SelectField label="Priority" options={PRIORITY_OPTIONS} {...getFieldProps('priority')} />
        <SelectField
          label="Salesperson"
          options={SALESPERSON_OPTIONS}
          {...getFieldProps('salespersonId')}
        />
      </div>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save lead</Button>
      </div>
    </form>
  );
}
