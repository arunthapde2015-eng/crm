import { getSalesData } from '../api/salesData';
import { ORDER_STATUSES, PERIODS } from '../constants';
import {
  getAgeingBuckets,
  getSalesBySalesperson,
  getSalesMetrics,
  getTargetAchievement,
} from './metrics';
import {
  createOrder,
  getAllowedStatuses,
  getOrderOutstanding,
  getOrderTotal,
  getPaymentError,
  getPaymentStatus,
} from './orders';
import { getPeriodRange } from './period';
import { createSalesperson, findDuplicateSalesperson } from './team';

const TODAY = new Date(2026, 9, 1);
const DATA = getSalesData();
const THIS_YEAR = getPeriodRange(PERIODS.THIS_YEAR, TODAY);
const orderById = (id) => DATA.orders.find((order) => order.id === id);

describe('periods', () => {
  it('starts weeks on Monday and quarters on their first month', () => {
    expect(getPeriodRange(PERIODS.THIS_WEEK, TODAY)).toEqual({
      from: '2026-09-28',
      to: '2026-10-01',
    });
    expect(getPeriodRange(PERIODS.THIS_QUARTER, new Date(2026, 7, 15)).from).toBe('2026-07-01');
  });
});

describe('order money', () => {
  it('applies discount before GST', () => {
    // 3 × ₹15,000 less 10% = ₹40,500, plus 18% GST.
    expect(getOrderTotal(orderById('ORD-2026-0007'))).toBe(47790);
  });

  it('derives payment status and outstanding', () => {
    expect(getPaymentStatus(orderById('ORD-2026-0001'))).toBe('paid');
    expect(getPaymentStatus(orderById('ORD-2026-0005'))).toBe('partial');
    expect(getOrderOutstanding(orderById('ORD-2026-0005'))).toBe(25815);
    expect(getOrderOutstanding(orderById('ORD-2026-0010'))).toBe(0);
  });

  it('never lets an order with payments be cancelled or drafted', () => {
    expect(getAllowedStatuses(orderById('ORD-2026-0005'))).not.toContain(ORDER_STATUSES.CANCELLED);
    expect(getAllowedStatuses(orderById('ORD-2026-0006'))).toContain(ORDER_STATUSES.CANCELLED);
  });

  it('numbers new orders after the highest for the year', () => {
    const order = createOrder(
      {
        customer: ' Acme ',
        salespersonId: 'rohan',
        product: 'POS',
        quantity: '2',
        unitPrice: '1000',
        discountPercent: '',
        gstRate: '18',
        date: '2026-10-01',
        expectedDate: '',
        status: ORDER_STATUSES.CONFIRMED,
      },
      DATA.orders,
    );
    expect(order).toMatchObject({ number: 'ORD-2026-0011', customer: 'Acme', discountPercent: 0 });
    expect(getOrderTotal(order)).toBe(2360);
  });
});

describe('getPaymentError', () => {
  it('blocks overpayment and payments on non-sale orders', () => {
    expect(getPaymentError(orderById('ORD-2026-0005'), 25816)).toMatch(/more than the outstanding/);
    expect(getPaymentError(orderById('ORD-2026-0008'), 100)).toMatch(/confirmed orders/);
    expect(getPaymentError(orderById('ORD-2026-0005'), 0)).toMatch(/greater than zero/);
    expect(getPaymentError(orderById('ORD-2026-0005'), 25815)).toBeNull();
  });
});

describe('sales metrics', () => {
  it('summarises leads and money for the period, ignoring draft and cancelled orders', () => {
    expect(getSalesMetrics(DATA, THIS_YEAR)).toEqual({
      totalLeads: 16,
      newLeads: 2,
      qualified: 1,
      proposals: 1,
      negotiations: 1,
      won: 6,
      lost: 2,
      conversionRate: 38,
      totalSales: 762051,
      collected: 430370,
      pending: 331681,
      averageDealValue: 95256,
    });
  });

  it('ranks salespersons by sales value', () => {
    expect(getSalesBySalesperson(DATA, THIS_YEAR).map((row) => [row.label, row.value])).toEqual([
      ['Rohan Kulkarni', 602095],
      ['Sneha Patil', 112166],
      ['Vikram Joshi', 47790],
    ]);
  });

  it('works out target, achievement, remaining and %', () => {
    const [, rohan] = getTargetAchievement(DATA, '2026-10');
    expect(rohan).toMatchObject({
      target: 600000,
      achieved: 212400,
      remaining: 387600,
      percent: 35,
    });
  });

  it('ages outstanding money by order date', () => {
    const buckets = getAgeingBuckets(DATA.orders, TODAY);
    expect(buckets.map((bucket) => [bucket.id, bucket.orderCount, bucket.amount])).toEqual([
      ['0-30', 4, 307305],
      ['31-60', 2, 24376],
      ['61-90', 0, 0],
      ['90+', 0, 0],
    ]);
  });
});

describe('team', () => {
  it('assigns the next employee id and spots duplicate contacts', () => {
    const values = {
      name: 'Neha',
      mobile: '9822011102',
      email: 'new@finsolis.in',
      territory: '',
      joinedOn: '2026-10-01',
      monthlyTarget: '300000',
    };
    expect(createSalesperson(values, DATA.team).employeeId).toBe('EMP-0104');
    expect(findDuplicateSalesperson(values, DATA.team)?.name).toBe('Rohan Kulkarni');
    expect(findDuplicateSalesperson(values, DATA.team, 'rohan')).toBeNull();
  });
});
