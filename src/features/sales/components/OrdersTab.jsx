import { useState } from 'react';

import { BADGE_TONES, Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { SelectField } from '@/components/SelectField';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { ORDER_STATUS_LABELS, PAYMENT_STATUSES, PAYMENT_STATUS_LABELS } from '../constants';
import {
  createOrder,
  getAllowedStatuses,
  getOrderPaid,
  getOrderTotal,
  getPaymentStatus,
  isSaleOrder,
} from '../utils/orders';
import { OrderForm } from './OrderForm';
import layout from './SalesLayout.module.css';

const ALL = 'all';
const COLUMN_COUNT = 9;
const PAYMENT_TONES = {
  [PAYMENT_STATUSES.UNPAID]: BADGE_TONES.WARNING,
  [PAYMENT_STATUSES.PARTIAL]: BADGE_TONES.INFO,
  [PAYMENT_STATUSES.PAID]: BADGE_TONES.SUCCESS,
};

function filterOrders(orders, { query, status, salespersonId }) {
  const normalizedQuery = query.trim().toLowerCase();
  return orders
    .filter(
      (order) =>
        `${order.number} ${order.customer} ${order.product}`
          .toLowerCase()
          .includes(normalizedQuery) &&
        (status === ALL || order.status === status) &&
        (salespersonId === ALL || order.salespersonId === salespersonId),
    )
    .sort((first, second) => second.date.localeCompare(first.date));
}

/**
 * @param {object} props
 * @param {object} props.data
 * @param {Date} props.today
 * @param {(order: object) => void} props.onAddOrder
 * @param {(orderId: string, status: string) => void} props.onStatusChange
 */
export function OrdersTab({ data, today, onAddOrder, onStatusChange }) {
  const [filters, setFilters] = useState({ query: '', status: ALL, salespersonId: ALL });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const names = new Map(data.team.map((member) => [member.id, member.name]));
  const visibleOrders = filterOrders(data.orders, filters);

  function setFilter(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(values) {
    onAddOrder(createOrder(values, data.orders));
    setIsFormOpen(false);
  }

  return (
    <div className={layout.stack}>
      {isFormOpen && (
        <OrderForm
          team={data.team}
          today={today}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
      <div className={layout.toolbar}>
        <div className={layout.filters}>
          <label htmlFor="order-search" className="visually-hidden">
            Search orders
          </label>
          <input
            id="order-search"
            type="search"
            className={layout.searchInput}
            placeholder="Search order, customer or product"
            value={filters.query}
            onChange={(event) => setFilter('query', event.target.value)}
          />
          <SelectField
            id="order-status-filter"
            label="Order status"
            isLabelHidden
            options={[
              { value: ALL, label: 'All statuses' },
              ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
            ]}
            value={filters.status}
            onChange={(event) => setFilter('status', event.target.value)}
          />
          <SelectField
            id="order-salesperson-filter"
            label="Salesperson"
            isLabelHidden
            options={[
              { value: ALL, label: 'All salespersons' },
              ...data.team.map((member) => ({ value: member.id, label: member.name })),
            ]}
            value={filters.salespersonId}
            onChange={(event) => setFilter('salespersonId', event.target.value)}
          />
        </div>
        <Button onClick={() => setIsFormOpen(true)} disabled={isFormOpen}>
          New order
        </Button>
      </div>

      <DataTable caption="Orders" tableClassName={layout.table}>
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Customer</th>
            <th scope="col">Salesperson</th>
            <th scope="col">Product</th>
            <th scope="col" className={layout.numeric}>
              Total
            </th>
            <th scope="col" className={layout.numeric}>
              Paid
            </th>
            <th scope="col">Payment</th>
            <th scope="col">Expected</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {visibleOrders.length === 0 && (
            <tr>
              <td colSpan={COLUMN_COUNT} className={layout.empty}>
                No orders match these filters.
              </td>
            </tr>
          )}
          {visibleOrders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              salespersonName={names.get(order.salespersonId) ?? 'Unassigned'}
              onStatusChange={(status) => onStatusChange(order.id, status)}
            />
          ))}
        </tbody>
      </DataTable>
      <p className={layout.note}>
        Orders with payments can’t be cancelled or returned to draft, so money received always stays
        linked to an order.
      </p>
    </div>
  );
}

function OrderRow({ order, salespersonName, onStatusChange }) {
  const paymentStatus = getPaymentStatus(order);
  const selectId = `order-status-${order.id}`;

  return (
    <tr>
      <th scope="row" className={layout.nowrap}>
        {order.number}
        <span className={layout.secondary}>{formatDayMonthYear(parseIsoDate(order.date))}</span>
      </th>
      <td>{order.customer}</td>
      <td>{salespersonName}</td>
      <td>
        {order.product}
        <span className={layout.secondary}>
          {order.quantity} × {formatCurrency(order.unitPrice)}
          {order.discountPercent > 0 && `, ${order.discountPercent}% off`}, GST {order.gstRate}%
        </span>
      </td>
      <td className={layout.numeric}>{formatCurrency(getOrderTotal(order))}</td>
      <td className={layout.numeric}>{formatCurrency(getOrderPaid(order))}</td>
      <td>
        {isSaleOrder(order) ? (
          <Badge tone={PAYMENT_TONES[paymentStatus]}>{PAYMENT_STATUS_LABELS[paymentStatus]}</Badge>
        ) : (
          <Badge>Not billable</Badge>
        )}
      </td>
      <td className={layout.nowrap}>
        {order.expectedDate ? formatDayMonthYear(parseIsoDate(order.expectedDate)) : '—'}
      </td>
      <td>
        <label htmlFor={selectId} className="visually-hidden">
          Status of {order.number}
        </label>
        <select
          id={selectId}
          className={layout.inlineSelect}
          value={order.status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          {getAllowedStatuses(order).map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}
