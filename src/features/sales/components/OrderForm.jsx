import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { formatCurrency } from '@/utils/formatCurrency';
import { toIsoDate } from '@/utils/formatDate';

import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '../constants';
import { getOrderTotal } from '../utils/orders';
import { isActiveSalesperson } from '../utils/team';
import layout from './SalesLayout.module.css';

const GST_RATES = ['0', '5', '12', '18', '28'];
const DEFAULT_GST_RATE = '18';
// New orders start as draft or confirmed; later states are set from the order list.
const STARTING_STATUSES = [ORDER_STATUSES.DRAFT, ORDER_STATUSES.CONFIRMED];

/**
 * @param {object} props
 * @param {object[]} props.team - Only active salespersons can take new orders.
 * @param {Date} props.today
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function OrderForm({ team, today, onSubmit, onCancel }) {
  const activeTeam = team.filter(isActiveSalesperson);
  const [values, setValues] = useState({
    customer: '',
    salespersonId: activeTeam[0]?.id ?? '',
    product: '',
    quantity: '1',
    unitPrice: '',
    discountPercent: '0',
    gstRate: DEFAULT_GST_RATE,
    date: toIsoDate(today),
    expectedDate: '',
    status: ORDER_STATUSES.CONFIRMED,
  });
  const customerRef = useRef(null);

  useEffect(() => {
    customerRef.current?.focus();
  }, []);

  const previewTotal = getOrderTotal({
    quantity: Number(values.quantity) || 0,
    unitPrice: Number(values.unitPrice) || 0,
    discountPercent: Number(values.discountPercent) || 0,
    gstRate: Number(values.gstRate),
  });

  function getFieldProps(name) {
    return {
      id: `order-form-${name}`,
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
    <form className={layout.form} onSubmit={handleSubmit} aria-labelledby="order-form-title">
      <h2 id="order-form-title" className={layout.formTitle}>
        New order
      </h2>
      <div className={layout.formGrid}>
        <TextField ref={customerRef} label="Customer" required {...getFieldProps('customer')} />
        <SelectField
          label="Salesperson"
          options={activeTeam.map((member) => ({ value: member.id, label: member.name }))}
          required
          {...getFieldProps('salespersonId')}
        />
        <TextField label="Product / service" required {...getFieldProps('product')} />
        <TextField
          label="Quantity"
          type="number"
          min="1"
          step="1"
          required
          {...getFieldProps('quantity')}
        />
        <TextField
          label="Unit price (₹)"
          type="number"
          min="0"
          required
          {...getFieldProps('unitPrice')}
        />
        <TextField
          label="Discount (%)"
          type="number"
          min="0"
          max="100"
          {...getFieldProps('discountPercent')}
        />
        <SelectField
          label="GST"
          options={GST_RATES.map((rate) => ({ value: rate, label: `${rate}%` }))}
          {...getFieldProps('gstRate')}
        />
        <SelectField
          label="Status"
          options={STARTING_STATUSES.map((status) => ({
            value: status,
            label: ORDER_STATUS_LABELS[status],
          }))}
          {...getFieldProps('status')}
        />
        <TextField label="Order date" type="date" required {...getFieldProps('date')} />
        <TextField
          label="Expected delivery / activation"
          type="date"
          min={values.date}
          {...getFieldProps('expectedDate')}
        />
      </div>
      <p className={layout.note} aria-live="polite">
        Order total incl. GST: {formatCurrency(previewTotal)}
      </p>
      <div className={layout.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save order</Button>
      </div>
    </form>
  );
}
