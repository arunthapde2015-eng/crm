export const TICKET_STATUSES = {
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  WAITING: 'waiting',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const TICKET_STATUS_LABELS = {
  [TICKET_STATUSES.OPEN]: 'Open',
  [TICKET_STATUSES.IN_PROGRESS]: 'In Progress',
  [TICKET_STATUSES.WAITING]: 'Waiting on Customer',
  [TICKET_STATUSES.RESOLVED]: 'Resolved',
  [TICKET_STATUSES.CLOSED]: 'Closed',
};

// Tickets still needing work; these can be past due.
export const ACTIVE_STATUSES = [
  TICKET_STATUSES.OPEN,
  TICKET_STATUSES.IN_PROGRESS,
  TICKET_STATUSES.WAITING,
];

export const PRIORITIES = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };

export const PRIORITY_LABELS = {
  [PRIORITIES.HIGH]: 'High',
  [PRIORITIES.MEDIUM]: 'Medium',
  [PRIORITIES.LOW]: 'Low',
};

// Days from raising a ticket to its due date, by priority.
export const RESPONSE_DAYS = {
  [PRIORITIES.HIGH]: 1,
  [PRIORITIES.MEDIUM]: 3,
  [PRIORITIES.LOW]: 7,
};

// Higher sorts first when two tickets fall due on the same day.
export const PRIORITY_RANK = {
  [PRIORITIES.HIGH]: 3,
  [PRIORITIES.MEDIUM]: 2,
  [PRIORITIES.LOW]: 1,
};

export const TICKET_CATEGORIES = [
  'Technical issue',
  'Hardware',
  'Billing',
  'Training',
  'Account change',
  'Other',
];

// Tickets are numbered per Indian financial year: TKT-<FY start year>-<sequence>.
export const TICKET_NUMBER_PREFIX = 'TKT';
export const ALL_FILTER_VALUE = 'all';
export const UNASSIGNED_VALUE = 'unassigned';
export const MAX_TEXT_LENGTH = 1000;

const { OPEN, IN_PROGRESS, WAITING, RESOLVED } = TICKET_STATUSES;
const { HIGH, MEDIUM, LOW } = PRIORITIES;

// Work done so far on each ticket, oldest first.
// prettier-ignore
const INITIAL_UPDATES = {
  'TKT-2026-0002': [update('2026-09-25', 'Rohan Kulkarni', 'Reproduced the timeout; escalated to the payment gateway team.', IN_PROGRESS)],
  'TKT-2026-0003': [update('2026-09-23', 'Meera Iyer', 'Emailed April–June invoice copies to the accountant.', RESOLVED)],
  'TKT-2026-0004': [update('2026-09-27', 'Priya Sawant', 'Asked the branch for a convenient training date.', WAITING)],
};

// Placeholder tickets until there's a helpdesk API. `due` is the raised date plus RESPONSE_DAYS.
// Formatting is skipped so each ticket stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_TICKETS = [
  ticket('TKT-2026-0001', '2026-09-28', '2026-09-29', 'POS terminal not printing receipts', 'Konkan Fresh Mart, Panaji', '9823010004', 'Technical issue', HIGH, 'priya', OPEN,
    'Terminal powers on and takes payments but the receipt printer feeds blank paper.'),
  ticket('TKT-2026-0002', '2026-09-24', '2026-09-25', 'Parents unable to pay fees through app', 'Vidya Vikas School, Wakad', '9823010001', 'Technical issue', HIGH, 'rohan', IN_PROGRESS,
    'Payment page times out after entering card details. Started after the app update.'),
  ticket('TKT-2026-0003', '2026-09-22', '2026-09-29', 'Need GST invoice copy for last quarter', 'Sahyadri Multispeciality Clinic', '9823010002', 'Billing', LOW, 'meera', RESOLVED,
    'Accountant needs copies of all invoices from April to June for GST filing.'),
  ticket('TKT-2026-0004', '2026-09-26', '2026-09-29', 'Training for new cashier staff', 'Nirmal Credit Society, Head Office', '9823010003', 'Training', MEDIUM, 'priya', WAITING,
    'Two new cashiers joined; they need a walkthrough of collections and day-end reports.'),
];

function ticket(
  number,
  raisedOn,
  due,
  subject,
  customer,
  phone,
  category,
  priority,
  assigneeId,
  status,
  description,
) {
  return {
    id: number,
    number,
    raisedOn,
    due,
    subject,
    customer,
    phone,
    category,
    priority,
    assigneeId,
    status,
    description,
    updates: INITIAL_UPDATES[number] ?? [],
  };
}

function update(date, by, note, status) {
  return { id: `${date}-${by}`, date, by, note, status };
}
