// Placeholder sales records until the sales API exists. Shaped like a future
// `GET /sales` response so swapping in real data doesn't touch the screens.
// Dates are ISO (YYYY-MM-DD). Formatting is skipped so each record stays on one line.

import { SALESPERSONS } from '@/constants/team';

import { LEAD_STAGES, ORDER_STATUSES, SALESPERSON_STATUSES } from '../constants';

const { CONFIRMED, PROCESSING, COMPLETED, CANCELLED, DRAFT } = ORDER_STATUSES;
const { NEW, CONTACTED, QUALIFIED, FOLLOW_UP, PROPOSAL, NEGOTIATION, WON, LOST, ON_HOLD } =
  LEAD_STAGES;

const PROFILE_DETAILS = {
  vikram: {
    employeeId: 'EMP-0101',
    mobile: '9822011101',
    territory: 'Goa & Konkan',
    joinedOn: '2024-06-10',
    monthlyTarget: 400000,
  },
  rohan: {
    employeeId: 'EMP-0102',
    mobile: '9822011102',
    territory: 'Pune & Satara',
    joinedOn: '2023-02-01',
    monthlyTarget: 600000,
  },
  sneha: {
    employeeId: 'EMP-0103',
    mobile: '9822011103',
    territory: 'Mumbai & Thane',
    joinedOn: '2023-11-15',
    monthlyTarget: 500000,
  },
};

const SALES_TEAM = SALESPERSONS.map(({ id, name }) => ({
  id,
  name,
  email: `${id}@finsolis.in`,
  department: 'Sales',
  status: SALESPERSON_STATUSES.ACTIVE,
  ...PROFILE_DETAILS[id],
}));

/* prettier-ignore */
const ORDERS = [
  order(1, '2026-07-08', 'Vidya Vikas School Trust', 'rohan', 'School fee collection software', 1, 120000, 0, 18, COMPLETED, '2026-07-15', [pay(1, '2026-07-20', 141600, 'Bank transfer', 'NEFT-88213', 'rohan')]),
  order(2, '2026-07-25', 'Nirmal Co-operative Credit Society', 'rohan', 'Custom API integration', 1, 150000, 0, 18, COMPLETED, '2026-08-05', [pay(2, '2026-08-10', 177000, 'Bank transfer', 'RTGS-55102', 'rohan')]),
  order(3, '2026-08-12', 'Sahyadri Multispeciality Clinic', 'sneha', 'Payment gateway integration', 1, 90500, 0, 18, COMPLETED, '2026-08-20', [pay(3, '2026-08-30', 87790, 'UPI', 'UPI-4471920', 'sneha')]),
  order(4, '2026-08-28', 'Konkan Fresh Mart', 'sneha', 'Smart POS terminal', 2, 2400, 0, 12, PROCESSING, '2026-09-10', []),
  order(5, '2026-09-05', 'Metro Fitness Studio', 'rohan', 'Smart POS terminal', 1, 25250, 0, 18, PROCESSING, '2026-09-15', [pay(4, '2026-09-12', 3980, 'UPI', 'UPI-4490017', 'rohan')]),
  order(6, '2026-09-14', 'Shivneri Hotels', 'rohan', 'Hotel POS and billing', 1, 35000, 0, 18, CONFIRMED, '2026-10-05', []),
  order(7, '2026-09-22', 'Panchganga Agro Traders', 'vikram', 'GST billing software', 3, 15000, 10, 18, CONFIRMED, '2026-10-10', [pay(5, '2026-09-30', 20000, 'Cheque', 'CHQ-004512', 'vikram')]),
  order(8, '2026-09-29', 'Green Leaf Organic Store', 'sneha', 'Smart POS terminal', 1, 40000, 5, 18, DRAFT, '2026-10-20', []),
  order(9, '2026-10-01', 'Deccan Institute of Management', 'rohan', 'School fee collection software', 3, 60000, 0, 18, CONFIRMED, '2026-10-30', []),
  order(10, '2026-08-02', 'Laxmi Textiles', 'vikram', 'GST billing software', 1, 18600, 0, 18, CANCELLED, '2026-08-15', []),
];

/* prettier-ignore */
const LEADS = [
  lead('2026-07-03', 'rohan', WON, 141600), lead('2026-07-10', 'rohan', WON, 177000),
  lead('2026-07-18', 'sneha', WON, 106790), lead('2026-07-28', 'vikram', LOST, 21948),
  lead('2026-08-04', 'sneha', QUALIFIED, 47200), lead('2026-08-16', 'rohan', WON, 29795),
  lead('2026-08-22', 'vikram', WON, 53100), lead('2026-08-30', 'sneha', ON_HOLD, 30000),
  lead('2026-09-03', 'rohan', NEGOTIATION, 212400), lead('2026-09-08', 'sneha', PROPOSAL, 44840),
  lead('2026-09-12', 'vikram', CONTACTED, 25000), lead('2026-09-17', 'rohan', WON, 41300),
  lead('2026-09-21', 'sneha', FOLLOW_UP, 38000), lead('2026-09-26', 'vikram', LOST, 165200),
  lead('2026-09-29', 'rohan', NEW, 32000), lead('2026-10-01', 'sneha', NEW, 27000),
];

export function getSalesData() {
  return { team: SALES_TEAM, orders: ORDERS, leads: LEADS };
}

function order(
  sequence,
  date,
  customer,
  salespersonId,
  product,
  quantity,
  unitPrice,
  discountPercent,
  gstRate,
  status,
  expectedDate,
  payments,
) {
  const number = `ORD-2026-${String(sequence).padStart(4, '0')}`;
  return {
    id: number,
    number,
    date,
    customer,
    salespersonId,
    product,
    quantity,
    unitPrice,
    discountPercent,
    gstRate,
    status,
    expectedDate,
    payments,
  };
}

function pay(sequence, date, amount, mode, reference, collectedBy) {
  return {
    id: `PAY-2026-${String(sequence).padStart(4, '0')}`,
    date,
    amount,
    mode,
    reference,
    collectedBy,
  };
}

function lead(date, salespersonId, stage, value) {
  return { id: `${date}-${salespersonId}`, date, salespersonId, stage, value };
}
