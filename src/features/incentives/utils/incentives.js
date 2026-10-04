import { toIsoDate } from '@/utils/formatDate';

import {
  ALL_FILTER_VALUE,
  ID_DIGITS,
  ORDER_STATUSES,
  PAYOUT_FILTERS,
  PAYOUT_NUMBER_PREFIX,
  RULE_TYPES,
} from '../constants';
import { calculateOrderIncentive, describeOrderBasis } from './rules';

/** Cancelled orders earn nothing (unless already paid, which stays on record). */
export function isEligibleOrder(order) {
  return order.status !== ORDER_STATUSES.CANCELLED;
}

function getMonthTotals(orders) {
  const totals = new Map();
  orders.filter(isEligibleOrder).forEach((order) => {
    const key = `${order.salespersonId}:${order.date.slice(0, 7)}`;
    totals.set(key, (totals.get(key) ?? 0) + order.value);
  });
  return totals;
}

function getPaidLines(payouts) {
  const paid = new Map();
  payouts.forEach((payout) => {
    payout.lines.forEach((line) => paid.set(line.orderId, { ...line, payout }));
  });
  return paid;
}

/**
 * Every order with its incentive. Paid orders show the amount actually paid; unpaid ones are
 * priced with the salesperson's current rule.
 */
export function getOrderIncentives({ orders, rules, payouts }) {
  const monthTotals = getMonthTotals(orders);
  const paidLines = getPaidLines(payouts);

  return orders
    .map((order) => {
      const rule = rules[order.salespersonId] ?? { type: null };
      const monthTotal = monthTotals.get(`${order.salespersonId}:${order.date.slice(0, 7)}`) ?? 0;
      const base = rule.type === RULE_TYPES.MONTHLY_SLABS ? monthTotal : order.value;
      const paidLine = paidLines.get(order.id);
      const isEligible = isEligibleOrder(order);
      return {
        ...order,
        basis: describeOrderBasis(rule, base),
        amount:
          paidLine?.amount ?? (isEligible ? calculateOrderIncentive(order, rule, monthTotal) : 0),
        isPaid: Boolean(paidLine),
        payout: paidLine?.payout ?? null,
        isEligible,
      };
    })
    .sort((first, second) => first.date.localeCompare(second.date));
}

/** Unpaid orders that are owed an incentive. */
export function isAwaitingPayout(row) {
  return !row.isPaid && row.isEligible && row.amount > 0;
}

/**
 * @param {object[]} rows - From getOrderIncentives.
 * @param {{ query, salespersonId, from, to, orderStatus, payout }} filters
 */
export function filterOrderIncentives(rows, filters) {
  const query = filters.query.trim().toLowerCase();
  return rows.filter((row) => {
    const searchable = `${row.number} ${row.customer} ${row.payout?.reference ?? ''}`.toLowerCase();
    return (
      searchable.includes(query) &&
      (filters.salespersonId === ALL_FILTER_VALUE || row.salespersonId === filters.salespersonId) &&
      (!filters.from || row.date >= filters.from) &&
      (!filters.to || row.date <= filters.to) &&
      (filters.orderStatus === ALL_FILTER_VALUE || row.status === filters.orderStatus) &&
      (filters.payout === PAYOUT_FILTERS.ALL ||
        (filters.payout === PAYOUT_FILTERS.PAID ? row.isPaid : !row.isPaid))
    );
  });
}

function sumAmounts(rows) {
  return rows.reduce((total, row) => total + row.amount, 0);
}

/** Headline figures for a set of order rows. */
export function summariseIncentives(rows) {
  const paidRows = rows.filter((row) => row.isPaid);
  const awaiting = rows.filter(isAwaitingPayout);
  return {
    orderCount: rows.length,
    earned: sumAmounts(rows),
    paid: sumAmounts(paidRows),
    unpaid: sumAmounts(awaiting),
    awaitingCount: awaiting.length,
  };
}

/** Per-salesperson figures, in team order; everyone is listed even with no orders. */
export function getSalespersonSummary(rows, team, rules) {
  return team.map((member) => {
    const ownRows = rows.filter((row) => row.salespersonId === member.id);
    const awaiting = ownRows.filter(isAwaitingPayout);
    return {
      ...member,
      rule: rules[member.id],
      ...summariseIncentives(ownRows),
      oldestPendingDate: awaiting[0]?.date ?? null,
      awaitingOrderIds: awaiting.map((row) => row.id),
    };
  });
}

function getNextPayoutNumber(payouts, year) {
  const yearPrefix = `${PAYOUT_NUMBER_PREFIX}-${year}-`;
  const highest = payouts
    .filter((payout) => payout.number.startsWith(yearPrefix))
    .reduce((max, payout) => Math.max(max, Number(payout.number.slice(yearPrefix.length))), 0);
  return `${yearPrefix}${String(highest + 1).padStart(ID_DIGITS, '0')}`;
}

/**
 * A payout for the given unpaid order rows, locking each order's current amount.
 *
 * @param {object[]} rows - Rows to pay; all must be for the same salesperson.
 * @param {{ date: string, mode: string, reference: string }} details
 * @param {object[]} existingPayouts
 */
export function createPayout(rows, details, existingPayouts) {
  const number = getNextPayoutNumber(existingPayouts, details.date.slice(0, 4));
  return {
    id: number,
    number,
    date: details.date,
    salespersonId: rows[0].salespersonId,
    lines: rows.map((row) => ({ orderId: row.id, amount: row.amount })),
    mode: details.mode,
    reference: details.reference.trim(),
  };
}

export function getPayoutTotal(payout) {
  return payout.lines.reduce((total, line) => total + line.amount, 0);
}

export function getDefaultPayoutDetails(today) {
  return { date: toIsoDate(today), mode: 'Bank transfer', reference: '' };
}
