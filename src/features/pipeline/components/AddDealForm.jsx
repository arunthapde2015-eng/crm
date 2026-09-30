import { useId, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { SALESPERSONS } from '@/constants/team';

import styles from './AddDealForm.module.css';

const EMPTY_VALUES = {
  name: '',
  product: '',
  value: '',
  salespersonId: '',
  expectedCloseDate: '',
};

const SALESPERSON_OPTIONS = [
  { value: '', label: 'Unassigned' },
  ...SALESPERSONS.map((salesperson) => ({ value: salesperson.id, label: salesperson.name })),
];

/**
 * @param {object} props
 * @param {(values: typeof EMPTY_VALUES) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function AddDealForm({ onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const headingId = useId();

  function getFieldProps(name) {
    return {
      id: `new-deal-${name}`,
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
        New lead in pipeline
      </h2>
      <div className={styles.grid}>
        <TextField label="Lead / organisation name" required {...getFieldProps('name')} />
        <TextField label="Product" required {...getFieldProps('product')} />
        <TextField label="Value (₹)" type="number" min="0" required {...getFieldProps('value')} />
        <SelectField
          label="Salesperson"
          options={SALESPERSON_OPTIONS}
          {...getFieldProps('salespersonId')}
        />
        <TextField
          label="Expected close date"
          type="date"
          required
          {...getFieldProps('expectedCloseDate')}
        />
      </div>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add to New</Button>
      </div>
    </form>
  );
}
