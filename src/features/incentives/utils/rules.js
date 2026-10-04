import { formatCurrency } from '@/utils/formatCurrency';

import { PERCENT, RULE_TYPES } from '../constants';

/** The rate of the slab an amount falls in. Slabs are sorted; the last has no upper limit. */
export function getSlabRate(amount, slabs) {
  const slab = slabs.find((item) => item.upTo === null || amount <= item.upTo);
  return slab?.rate ?? 0;
}

/** One-line summary of a rule, as shown in the salesperson summary. */
export function describeRule(rule) {
  switch (rule.type) {
    case RULE_TYPES.FIXED_PER_ORDER:
      return `${formatCurrency(rule.amount)} per order`;
    case RULE_TYPES.PERCENT_OF_ORDER:
      return `${rule.percent}% of order value`;
    case RULE_TYPES.ORDER_SLABS:
      return 'Slabs on order value, whole amount at the slab reached';
    case RULE_TYPES.MONTHLY_SLABS:
      return 'Slabs on monthly sales, whole amount at the slab reached';
    default:
      return 'No incentive';
  }
}

/** Lower bound shown for a slab, derived from the previous slab's limit. */
export function getSlabFrom(slabs, index) {
  return index === 0 ? 0 : slabs[index - 1].upTo + 1;
}

function validateSlabs(slabs) {
  const errors = [];
  if (slabs.length === 0) errors.push('Add at least one slab.');
  slabs.forEach((slab, index) => {
    const label = `Slab ${index + 1}`;
    const isLast = index === slabs.length - 1;
    if (!Number.isFinite(slab.rate) || slab.rate < 0 || slab.rate > PERCENT) {
      errors.push(`${label}: rate must be between 0 and 100%.`);
    }
    if (isLast) return;
    const previousLimit = index === 0 ? 0 : slabs[index - 1].upTo;
    if (!(slab.upTo > previousLimit)) {
      errors.push(`${label}: upper limit must be more than ${formatCurrency(previousLimit)}.`);
    }
  });
  return errors;
}

/** Problems with a rule, or [] if it can be saved. */
export function validateRule(rule) {
  switch (rule.type) {
    case RULE_TYPES.FIXED_PER_ORDER:
      return rule.amount >= 0 ? [] : ['Enter an amount of zero or more.'];
    case RULE_TYPES.PERCENT_OF_ORDER:
      return rule.percent >= 0 && rule.percent <= PERCENT
        ? []
        : ['Percentage must be between 0 and 100.'];
    case RULE_TYPES.ORDER_SLABS:
    case RULE_TYPES.MONTHLY_SLABS:
      return validateSlabs(rule.slabs);
    default:
      return ['Choose how the incentive is calculated.'];
  }
}

/** Short note of how an order's incentive was worked out, e.g. "2% slab". */
export function describeOrderBasis(rule, base) {
  switch (rule.type) {
    case RULE_TYPES.FIXED_PER_ORDER:
      return 'Fixed per order';
    case RULE_TYPES.PERCENT_OF_ORDER:
      return `${rule.percent}% of order`;
    case RULE_TYPES.ORDER_SLABS:
      return `${getSlabRate(base, rule.slabs)}% slab on order`;
    case RULE_TYPES.MONTHLY_SLABS:
      return `${getSlabRate(base, rule.slabs)}% slab on month’s sales of ${formatCurrency(base)}`;
    default:
      return '—';
  }
}

/**
 * The incentive one order earns under a rule. Monthly slabs use the salesperson's total for the
 * order's month to pick the rate, then apply it to this order.
 *
 * @param {object} order
 * @param {object} rule
 * @param {number} monthTotal - The salesperson's eligible sales in the order's month.
 */
export function calculateOrderIncentive(order, rule, monthTotal) {
  switch (rule.type) {
    case RULE_TYPES.FIXED_PER_ORDER:
      return rule.amount;
    case RULE_TYPES.PERCENT_OF_ORDER:
      return Math.round((order.value * rule.percent) / PERCENT);
    case RULE_TYPES.ORDER_SLABS:
      return Math.round((order.value * getSlabRate(order.value, rule.slabs)) / PERCENT);
    case RULE_TYPES.MONTHLY_SLABS:
      return Math.round((order.value * getSlabRate(monthTotal, rule.slabs)) / PERCENT);
    default:
      return 0;
  }
}
