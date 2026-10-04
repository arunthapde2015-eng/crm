import { useState } from 'react';

import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { STAT_TONES, StatGrid } from '@/components/StatGrid';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { getAgeInDays, getAgeingBuckets } from '../utils/metrics';
import { createPayment, getOrderOutstanding, listPayments } from '../utils/orders';
import { PaymentForm } from './PaymentForm';
import layout from './SalesLayout.module.css';

function formatDate(isoDate) {
  return formatDayMonthYear(parseIsoDate(isoDate));
}

/**
 * @param {object} props
 * @param {object} props.data
 * @param {Date} props.today
 * @param {(orderId: string, payment: object) => void} props.onAddPayment
 */
export function CollectionsTab({ data, today, onAddPayment }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const names = new Map(data.team.map((member) => [member.id, member.name]));
  const owingOrders = data.orders
    .filter((order) => getOrderOutstanding(order) > 0)
    .sort((first, second) => first.date.localeCompare(second.date));
  const payments = listPayments(data.orders);
  const ageingStats = getAgeingBuckets(data.orders, today).map((bucket, index) => ({
    id: bucket.id,
    label: `${bucket.label} (${bucket.orderCount})`,
    value: formatCurrency(bucket.amount),
    // The two oldest buckets need chasing first.
    tone: index >= 2 && bucket.amount > 0 ? STAT_TONES.DANGER : STAT_TONES.DEFAULT,
  }));

  function handleSubmit(orderId, values) {
    onAddPayment(orderId, createPayment(data.orders, values));
    setIsFormOpen(false);
  }

  return (
    <div className={layout.stack}>
      <div className={layout.toolbar}>
        <p className={layout.note}>Every payment is recorded against an order.</p>
        <Button
          onClick={() => setIsFormOpen(true)}
          disabled={isFormOpen || owingOrders.length === 0}
        >
          Record payment
        </Button>
      </div>
      {isFormOpen && (
        <PaymentForm
          payableOrders={owingOrders}
          team={data.team}
          today={today}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <div className={layout.section}>
        <h2 className={layout.sectionTitle}>Outstanding by age</h2>
        <StatGrid label="Outstanding by age" stats={ageingStats} />
      </div>

      <div className={layout.section}>
        <h2 className={layout.sectionTitle}>Outstanding orders</h2>
        <DataTable caption="Outstanding orders" tableClassName={layout.table}>
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Customer</th>
              <th scope="col">Salesperson</th>
              <th scope="col" className={layout.numeric}>
                Age
              </th>
              <th scope="col" className={layout.numeric}>
                Outstanding
              </th>
            </tr>
          </thead>
          <tbody>
            {owingOrders.length === 0 && (
              <tr>
                <td colSpan={5} className={layout.empty}>
                  Nothing outstanding.
                </td>
              </tr>
            )}
            {owingOrders.map((order) => (
              <tr key={order.id}>
                <th scope="row" className={layout.nowrap}>
                  {order.number}
                  <span className={layout.secondary}>{formatDate(order.date)}</span>
                </th>
                <td>{order.customer}</td>
                <td>{names.get(order.salespersonId) ?? 'Unassigned'}</td>
                <td className={layout.numeric}>{getAgeInDays(order.date, today)} days</td>
                <td className={layout.numeric}>{formatCurrency(getOrderOutstanding(order))}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>

      <div className={layout.section}>
        <h2 className={layout.sectionTitle}>Payments received</h2>
        <DataTable caption="Payments received" tableClassName={layout.table}>
          <thead>
            <tr>
              <th scope="col">Payment</th>
              <th scope="col">Order</th>
              <th scope="col">Customer</th>
              <th scope="col">Mode</th>
              <th scope="col">Reference</th>
              <th scope="col">Collected by</th>
              <th scope="col" className={layout.numeric}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <th scope="row" className={layout.nowrap}>
                  {payment.id}
                  <span className={layout.secondary}>{formatDate(payment.date)}</span>
                </th>
                <td className={layout.nowrap}>{payment.order.number}</td>
                <td>{payment.order.customer}</td>
                <td>{payment.mode}</td>
                <td>{payment.reference || '—'}</td>
                <td>{names.get(payment.collectedBy) ?? '—'}</td>
                <td className={layout.numeric}>{formatCurrency(payment.amount)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </div>
  );
}
