import { getMonthKeys, isInRange } from '@/utils/dateRange';
import { parseIsoDate } from '@/utils/formatDate';

import { AGEING_BUCKETS, LEAD_STAGES, PERCENT } from '../constants';
import { getOrderOutstanding, getOrderPaid, getOrderTotal, isSaleOrder } from './orders';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function sumBy(items, getValue) {
  return items.reduce((total, item) => total + getValue(item), 0);
}

export function toPercent(part, whole) {
  return whole > 0 ? Math.round((part / whole) * PERCENT) : 0;
}

/** Sale orders (not draft/cancelled) dated within the range. */
export function getSaleOrdersInRange(orders, range) {
  return orders.filter((order) => isSaleOrder(order) && isInRange(order.date, range));
}

/** Headline pipeline and money figures for the sales overview. */
export function getSalesMetrics({ orders, leads }, range) {
  const periodLeads = leads.filter((lead) => isInRange(lead.date, range));
  const countStage = (stage) => periodLeads.filter((lead) => lead.stage === stage).length;
  const saleOrders = getSaleOrdersInRange(orders, range);
  const totalSales = sumBy(saleOrders, getOrderTotal);
  const wonCount = countStage(LEAD_STAGES.WON);

  return {
    totalLeads: periodLeads.length,
    newLeads: countStage(LEAD_STAGES.NEW),
    qualified: countStage(LEAD_STAGES.QUALIFIED),
    proposals: countStage(LEAD_STAGES.PROPOSAL),
    negotiations: countStage(LEAD_STAGES.NEGOTIATION),
    won: wonCount,
    lost: countStage(LEAD_STAGES.LOST),
    conversionRate: toPercent(wonCount, periodLeads.length),
    totalSales,
    collected: sumBy(saleOrders, getOrderPaid),
    pending: sumBy(saleOrders, getOrderOutstanding),
    averageDealValue: saleOrders.length > 0 ? Math.round(totalSales / saleOrders.length) : 0,
  };
}

/** Sales value per salesperson in the range, highest first; everyone in the team is listed. */
export function getSalesBySalesperson({ orders, team }, range) {
  const saleOrders = getSaleOrdersInRange(orders, range);
  return team
    .map((member) => ({
      id: member.id,
      label: member.name,
      value: sumBy(
        saleOrders.filter((order) => order.salespersonId === member.id),
        getOrderTotal,
      ),
    }))
    .sort((first, second) => second.value - first.value);
}

/** Sales value for every month the range touches, oldest first. */
export function getSalesByMonth({ orders }, range) {
  const saleOrders = getSaleOrdersInRange(orders, range);
  return getMonthKeys(range).map((monthKey) => ({
    id: monthKey,
    monthKey,
    value: sumBy(
      saleOrders.filter((order) => order.date.startsWith(monthKey)),
      getOrderTotal,
    ),
  }));
}

/**
 * Target vs achievement for a month: sales value of that month's sale orders per salesperson.
 *
 * @param {{ orders: object[], team: object[] }} data
 * @param {string} monthKey - "YYYY-MM".
 */
export function getTargetAchievement({ orders, team }, monthKey) {
  const monthOrders = orders.filter(
    (order) => isSaleOrder(order) && order.date.startsWith(monthKey),
  );
  return team.map((member) => {
    const achieved = sumBy(
      monthOrders.filter((order) => order.salespersonId === member.id),
      getOrderTotal,
    );
    const target = member.monthlyTarget;
    return {
      id: member.id,
      name: member.name,
      target,
      achieved,
      remaining: Math.max(0, target - achieved),
      percent: toPercent(achieved, target),
    };
  });
}

export function getAgeInDays(isoDate, today) {
  return Math.floor((today - parseIsoDate(isoDate)) / MS_PER_DAY);
}

/** Outstanding money grouped by how long ago the order was placed. */
export function getAgeingBuckets(orders, today) {
  const owing = orders.filter((order) => getOrderOutstanding(order) > 0);
  return AGEING_BUCKETS.map((bucket, index) => {
    const minDays = index === 0 ? 0 : AGEING_BUCKETS[index - 1].maxDays + 1;
    const inBucket = owing.filter((order) => {
      const age = getAgeInDays(order.date, today);
      return age >= minDays && age <= bucket.maxDays;
    });
    return {
      ...bucket,
      orderCount: inBucket.length,
      amount: sumBy(inBucket, getOrderOutstanding),
    };
  });
}
