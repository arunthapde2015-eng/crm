import {
  ID_DIGITS,
  NON_SALE_ORDER_STATUSES,
  ORDER_NUMBER_PREFIX,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PERCENT,
} from '../constants';

/** Quantity × unit price, less the order discount. */
export function getOrderSubtotal(order) {
  const gross = order.quantity * order.unitPrice;
  return Math.round(gross - (gross * order.discountPercent) / PERCENT);
}

export function getOrderTax(order) {
  return Math.round((getOrderSubtotal(order) * order.gstRate) / PERCENT);
}

export function getOrderTotal(order) {
  return getOrderSubtotal(order) + getOrderTax(order);
}

export function getOrderPaid(order) {
  return order.payments.reduce((total, payment) => total + payment.amount, 0);
}

export function getOrderOutstanding(order) {
  return isSaleOrder(order) ? getOrderTotal(order) - getOrderPaid(order) : 0;
}

/** Confirmed, processing or completed: counts as a sale and can take payments. */
export function isSaleOrder(order) {
  return !NON_SALE_ORDER_STATUSES.includes(order.status);
}

export function getPaymentStatus(order) {
  const paid = getOrderPaid(order);
  if (paid === 0) return PAYMENT_STATUSES.UNPAID;
  return paid >= getOrderTotal(order) ? PAYMENT_STATUSES.PAID : PAYMENT_STATUSES.PARTIAL;
}

/**
 * Statuses an order may move to. Paid money can't be cancelled away: an order with payments
 * can't be cancelled (or sent back to draft) — refund it first.
 */
export function getAllowedStatuses(order) {
  const statuses = Object.values(ORDER_STATUSES);
  if (order.payments.length === 0) return statuses;
  return statuses.filter((status) => !NON_SALE_ORDER_STATUSES.includes(status));
}

function getNextNumber(records, prefix, year) {
  const yearPrefix = `${prefix}-${year}-`;
  const highest = records
    .filter((record) => record.number.startsWith(yearPrefix))
    .reduce((max, record) => Math.max(max, Number(record.number.slice(yearPrefix.length))), 0);
  return `${yearPrefix}${String(highest + 1).padStart(ID_DIGITS, '0')}`;
}

/**
 * A new order from form values, numbered after the existing orders for the year.
 *
 * @param {object} values - customer, salespersonId, product, quantity, unitPrice,
 *   discountPercent, gstRate, date, expectedDate, status
 */
export function createOrder(values, existingOrders) {
  const number = getNextNumber(existingOrders, ORDER_NUMBER_PREFIX, values.date.slice(0, 4));
  return {
    id: number,
    number,
    date: values.date,
    customer: values.customer.trim(),
    salespersonId: values.salespersonId,
    product: values.product.trim(),
    quantity: Number(values.quantity),
    unitPrice: Number(values.unitPrice),
    discountPercent: Number(values.discountPercent) || 0,
    gstRate: Number(values.gstRate),
    status: values.status,
    expectedDate: values.expectedDate || null,
    payments: [],
  };
}

/**
 * Why a payment can't be recorded against this order, or null if it can.
 * Payments must belong to a live order and can't exceed what's still owed.
 */
export function getPaymentError(order, amount) {
  if (!order) return 'Choose an order.';
  if (!isSaleOrder(order)) return 'Payments can only be recorded against confirmed orders.';
  if (!(amount > 0)) return 'Enter an amount greater than zero.';
  if (amount > getOrderOutstanding(order)) return 'Amount is more than the outstanding balance.';
  return null;
}

export function createPayment(orders, values) {
  const paymentCount = orders.reduce((count, order) => count + order.payments.length, 0);
  return {
    id: `PAY-${values.date.slice(0, 4)}-${String(paymentCount + 1).padStart(ID_DIGITS, '0')}`,
    date: values.date,
    amount: Number(values.amount),
    mode: values.mode,
    reference: values.reference.trim(),
    collectedBy: values.collectedBy,
  };
}

/** Every payment with its order, newest first. */
export function listPayments(orders) {
  return orders
    .flatMap((order) => order.payments.map((payment) => ({ ...payment, order })))
    .sort((first, second) => second.date.localeCompare(first.date));
}
