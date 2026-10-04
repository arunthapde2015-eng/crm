import { SALESPERSONS } from '@/constants/team';

import { getIncentiveData } from '../api/incentiveData';
import { DEFAULT_FILTERS, ORDER_STATUSES, PAYOUT_FILTERS, RULE_TYPES } from '../constants';
import {
  createPayout,
  filterOrderIncentives,
  getOrderIncentives,
  getSalespersonSummary,
  summariseIncentives,
} from './incentives';
import { calculateOrderIncentive, describeRule, getSlabRate, validateRule } from './rules';

const DATA = getIncentiveData();
const ROWS = getOrderIncentives(DATA);

describe('incentive figures', () => {
  it('matches the headline totals', () => {
    expect(summariseIncentives(ROWS)).toEqual({
      orderCount: 7,
      earned: 10495,
      paid: 5860,
      unpaid: 4635,
      awaitingCount: 4,
    });
  });

  it('summarises each salesperson with their oldest pending order', () => {
    const summary = getSalespersonSummary(ROWS, SALESPERSONS, DATA.rules);
    expect(
      summary.map((row) => [row.name, row.orderCount, row.earned, row.paid, row.unpaid]),
    ).toEqual([
      ['Vikram Joshi', 0, 0, 0, 0],
      ['Rohan Kulkarni', 5, 7495, 4360, 3135],
      ['Sneha Patil', 2, 3000, 1500, 1500],
    ]);
    expect(summary[1]).toMatchObject({ awaitingCount: 3, oldestPendingDate: '2026-08-13' });
    expect(summary[2]).toMatchObject({ awaitingCount: 1, oldestPendingDate: '2026-07-14' });
  });
});

describe('rules', () => {
  const slabs = DATA.rules.rohan.slabs;

  it('prices orders by each rule type', () => {
    const order = { value: 86750 };
    expect(calculateOrderIncentive(order, DATA.rules.rohan, 0)).toBe(1735);
    expect(calculateOrderIncentive(order, DATA.rules.sneha, 0)).toBe(1500);
    expect(
      calculateOrderIncentive(order, { type: RULE_TYPES.PERCENT_OF_ORDER, percent: 2.5 }, 0),
    ).toBe(2169);
    // Monthly slabs: the month's total picks the rate, applied to this order.
    expect(calculateOrderIncentive(order, DATA.rules.vikram, 250000)).toBe(2603);
  });

  it('describes rules and validates slabs', () => {
    expect(describeRule(DATA.rules.sneha)).toBe('₹1,500 per order');
    expect(getSlabRate(50000, slabs)).toBe(1);
    expect(getSlabRate(50001, slabs)).toBe(2);
    expect(
      validateRule({
        type: RULE_TYPES.ORDER_SLABS,
        slabs: [
          { upTo: 50000, rate: 1 },
          { upTo: 40000, rate: 2 },
          { upTo: null, rate: 3 },
        ],
      }),
    ).toEqual(['Slab 2: upper limit must be more than ₹50,000.']);
  });

  it('re-prices unpaid orders when a rule changes but keeps paid amounts', () => {
    const rows = getOrderIncentives({
      ...DATA,
      rules: { ...DATA.rules, rohan: { type: RULE_TYPES.FIXED_PER_ORDER, amount: 1000 } },
    });
    const rohan = rows.filter((row) => row.salespersonId === 'rohan');
    expect(rohan.map((row) => row.amount)).toEqual([3000, 1360, 1000, 1000, 1000]);
  });

  it('pays nothing on cancelled orders', () => {
    const orders = DATA.orders.map((order) =>
      order.id === 'ORD-2026-0007' ? { ...order, status: ORDER_STATUSES.CANCELLED } : order,
    );
    const row = getOrderIncentives({ ...DATA, orders }).find((item) => item.id === 'ORD-2026-0007');
    expect(row).toMatchObject({ amount: 0, isEligible: false });
  });
});

describe('filters and payouts', () => {
  it('filters by payout state and date', () => {
    const unpaid = filterOrderIncentives(ROWS, {
      ...DEFAULT_FILTERS,
      payout: PAYOUT_FILTERS.UNPAID,
    });
    expect(unpaid.map((row) => row.id)).toEqual([
      'ORD-2026-0003',
      'ORD-2026-0005',
      'ORD-2026-0006',
      'ORD-2026-0007',
    ]);
    const september = filterOrderIncentives(ROWS, {
      ...DEFAULT_FILTERS,
      from: '2026-09-01',
      to: '2026-09-30',
    });
    expect(september).toHaveLength(2);
  });

  it('creates a numbered payout that locks the amounts', () => {
    const rohanPending = ROWS.filter((row) => row.salespersonId === 'rohan' && !row.isPaid);
    const payout = createPayout(
      rohanPending,
      { date: '2026-10-01', mode: 'UPI', reference: ' UPI-1 ' },
      DATA.payouts,
    );
    expect(payout).toMatchObject({
      number: 'PO-2026-0003',
      salespersonId: 'rohan',
      reference: 'UPI-1',
    });
    expect(payout.lines.map((line) => line.amount)).toEqual([1050, 350, 1735]);

    const afterPayout = getOrderIncentives({ ...DATA, payouts: [...DATA.payouts, payout] });
    expect(summariseIncentives(afterPayout)).toMatchObject({ paid: 8995, unpaid: 1500 });
  });
});
