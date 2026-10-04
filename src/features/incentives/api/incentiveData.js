// Placeholder incentive records until the incentives API exists. Shaped like a future
// `GET /incentives` response. Dates are ISO (YYYY-MM-DD); order values exclude GST.

import { ORDER_STATUSES, RULE_TYPES } from '../constants';

const { CONFIRMED, PROCESSING, COMPLETED } = ORDER_STATUSES;

// Shared slab table for the two slab-based examples below. The last slab is open-ended.
const STANDARD_SLABS = [
  { id: 'slab-1', upTo: 50000, rate: 1 },
  { id: 'slab-2', upTo: 200000, rate: 2 },
  { id: 'slab-3', upTo: null, rate: 3 },
];

// One rule per salesperson. Changing a rule re-prices unpaid orders only.
const RULES = {
  vikram: { type: RULE_TYPES.MONTHLY_SLABS, slabs: STANDARD_SLABS },
  rohan: { type: RULE_TYPES.ORDER_SLABS, slabs: STANDARD_SLABS },
  sneha: { type: RULE_TYPES.FIXED_PER_ORDER, amount: 1500 },
};

/* prettier-ignore */
const ORDERS = [
  order(1, '2026-06-12', 'Sahyadri Multispeciality Clinic', 'sneha', 90500, COMPLETED),
  order(2, '2026-07-08', 'Nirmal Co-operative Credit Society', 'rohan', 150000, COMPLETED),
  order(3, '2026-07-14', 'Konkan Fresh Mart', 'sneha', 4800, PROCESSING),
  order(4, '2026-07-22', 'Sahyadri Diagnostics', 'rohan', 68000, COMPLETED),
  order(5, '2026-08-13', 'Nirmal Credit Society, Head Office', 'rohan', 52500, COMPLETED),
  order(6, '2026-09-14', 'Shivneri Hotels', 'rohan', 35000, CONFIRMED),
  order(7, '2026-09-29', 'SWARJY URBAN CO OP CREDIT SOCIETY LI PATHRI', 'rohan', 86750, PROCESSING),
];

// Each payout locks the amount paid per order, so later rate changes can't alter it.
/* prettier-ignore */
const PAYOUTS = [
  payout(1, '2026-06-30', 'sneha', [['ORD-2026-0001', 1500]], 'Salary', 'June salary'),
  payout(2, '2026-07-31', 'rohan', [['ORD-2026-0002', 3000], ['ORD-2026-0004', 1360]], 'Bank transfer', 'NEFT-20731'),
];

export function getIncentiveData() {
  return { orders: ORDERS, rules: RULES, payouts: PAYOUTS };
}

function order(sequence, date, customer, salespersonId, value, status) {
  const number = `ORD-2026-${String(sequence).padStart(4, '0')}`;
  return { id: number, number, date, customer, salespersonId, value, status };
}

function payout(sequence, date, salespersonId, lines, mode, reference) {
  const number = `PO-2026-${String(sequence).padStart(4, '0')}`;
  return {
    id: number,
    number,
    date,
    salespersonId,
    lines: lines.map(([orderId, amount]) => ({ orderId, amount })),
    mode,
    reference,
  };
}
