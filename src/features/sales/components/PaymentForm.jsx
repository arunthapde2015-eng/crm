import { useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { formatCurrency } from '@/utils/formatCurrency';
import { toIsoDate } from '@/utils/formatDate';

import { PAYMENT_MODES } from '../constants';
import { getOrderOutstanding, getPaymentError } from '../utils/orders';
import { isActiveSalesperson } from '../utils/team';
import layout from './SalesLayout.module.css';

/**
 * Records a payment against an order with money still owed.
 *
 * @param {object} props
 * @param {object[]} props.payableOrders - Orders that can take a payment.
 * @param {object[]} props.team
 * @param {Date} props.today
 * @param {(orderId: string, values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function PaymentForm({ payableOrders, team, today, onSubmit, onCancel }) {
  const activeTeam = team.filter(isActiveSalesperson);
  const [values, setValues] = useState({
    orderId: payableOrders[0]?.id ?? '',
    amount: '',
    date: toIsoDate(today),
    mode: PAYMENT_MODES[1],
    reference: '',
    collectedBy: activeTeam[0]?.id ?? '',
  });
  const [error, setError] = useState('');
  const selectedOrder = payableOrders.find((order) => order.id === values.orderId);

  function getFieldProps(name) {
    return {
      id: `payment-form-${name}`,
      name,
      value: values[name],
      onChange: (event) => {
        setValues((previous) => ({ ...previous, [name]: event.target.value }));
        setError('');
      },
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationError = getPaymentError(selectedOrder, Number(values.amount));
    if (validationError) {
      setError(validationError);
      return;
    }
    onSubmit(values.orderId, values);
  }

  return (
    <form className={layout.form} onSubmit={handleSubmit} aria-labelledby="payment-form-title">
      <h2 id="payment-form-title" className={layout.formTitle}>
        Record payment
      </h2>
      <div className={layout.formGrid}>
        <SelectField
          label="Order"
          options={payableOrders.map((order) => ({
            value: order.id,
            label: `${order.number} · ${order.customer} · ${formatCurrency(getOrderOutstanding(order))} due`,
          }))}
          {...getFieldProps('orderId')}
        />
        {/* No `max`: overpayment is caught on submit with a clearer message than the browser's. */}
        <TextField label="Amount (₹)" type="number" min="1" required {...getFieldProps('amount')} />
        <TextField label="Payment date" type="date" required {...getFieldProps('date')} />
        <SelectField
          label="Mode"
          options={PAYMENT_MODES.map((mode) => ({ value: mode, label: mode }))}
          {...getFieldProps('mode')}
        />
        <TextField label="Transaction reference" {...getFieldProps('reference')} />
        <SelectField
          label="Collected by"
          options={activeTeam.map((member) => ({ value: member.id, label: member.name }))}
          {...getFieldProps('collectedBy')}
        />
      </div>
      {error && (
        <p className={layout.formError} role="alert">
          {error}
        </p>
      )}
      <div className={layout.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save payment</Button>
      </div>
    </form>
  );
}
