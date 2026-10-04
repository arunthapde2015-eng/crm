import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { formatCurrency } from '@/utils/formatCurrency';
import { GST_RATES } from '@/utils/lineItems';

import { getGstAmount, validateBill } from '../utils/purchases';
import styles from './Purchases.module.css';

const GST_OPTIONS = GST_RATES.map((rate) => ({ value: String(rate), label: `${rate}%` }));

/**
 * Enters a bill received from a vendor. It is saved as unpaid.
 *
 * @param {object} props
 * @param {object} props.initialValues
 * @param {object[]} props.bills - Existing bills, for duplicate checks.
 * @param {object[]} props.vendors
 * @param {string} props.todayIso
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function BillForm({ initialValues, bills, vendors, todayIso, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const vendorRef = useRef(null);
  const amount = Number(values.amount) || 0;
  const gst = getGstAmount({ amount, gstRate: Number(values.gstRate) });
  const vendorOptions = [
    { value: '', label: 'Choose a vendor' },
    ...vendors.map((vendor) => ({ value: vendor.id, label: vendor.name })),
  ];

  useEffect(() => {
    vendorRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `bill-form-${name}`,
      name,
      value: values[name],
      onChange: (event) => {
        setValues((previous) => ({ ...previous, [name]: event.target.value }));
        setErrors([]);
      },
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateBill(values, bills, vendors, todayIso);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="bill-form-title">
      <h2 id="bill-form-title" className={styles.formTitle}>
        Add purchase bill
      </h2>
      <div className={styles.grid}>
        <SelectField
          ref={vendorRef}
          label="Vendor"
          options={vendorOptions}
          {...getFieldProps('vendorId')}
        />
        <TextField label="Vendor bill no." required {...getFieldProps('vendorBillNumber')} />
        <TextField label="Bill date" type="date" required {...getFieldProps('date')} />
        <TextField label="Description" required {...getFieldProps('description')} />
        <TextField
          label="Amount (₹, before GST)"
          type="number"
          min="1"
          required
          {...getFieldProps('amount')}
        />
        <SelectField label="GST rate" options={GST_OPTIONS} {...getFieldProps('gstRate')} />
      </div>
      <p className={styles.totals}>
        GST {formatCurrency(gst)}, bill total {formatCurrency(amount + gst)}
      </p>
      {errors.length > 0 && (
        <ul className={styles.errors} role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save bill</Button>
      </div>
    </form>
  );
}
