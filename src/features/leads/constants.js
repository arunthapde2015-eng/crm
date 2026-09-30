export const LEAD_STATUSES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  WON: 'won',
  LOST: 'lost',
};

export const LEAD_STATUS_LABELS = {
  [LEAD_STATUSES.NEW]: 'New',
  [LEAD_STATUSES.CONTACTED]: 'Contacted',
  [LEAD_STATUSES.QUALIFIED]: 'Qualified',
  [LEAD_STATUSES.WON]: 'Won',
  [LEAD_STATUSES.LOST]: 'Lost',
};

// Leads still being worked; these count toward a salesperson's workload.
export const OPEN_LEAD_STATUSES = [
  LEAD_STATUSES.NEW,
  LEAD_STATUSES.CONTACTED,
  LEAD_STATUSES.QUALIFIED,
];

export const LEAD_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const LEAD_PRIORITY_LABELS = {
  [LEAD_PRIORITIES.HIGH]: 'High',
  [LEAD_PRIORITIES.MEDIUM]: 'Medium',
  [LEAD_PRIORITIES.LOW]: 'Low',
};

export const LEAD_SOURCES = [
  'Referral',
  'Google',
  'Website',
  'WhatsApp',
  'Facebook',
  'Exhibition/Event',
  'Cold call',
  'Walk-in',
];

export const FOLLOW_UP_STATES = {
  OVERDUE: 'overdue',
  TODAY: 'today',
  UPCOMING: 'upcoming',
};

export const ALL_FILTER_VALUE = 'all';
export const UNASSIGNED_FILTER_VALUE = 'unassigned';

export const DEFAULT_LEAD_FILTERS = {
  query: '',
  status: ALL_FILTER_VALUE,
  source: ALL_FILTER_VALUE,
  salesperson: ALL_FILTER_VALUE,
};

export const LEAD_NUMBER_PREFIX = 'LD';
export const LEAD_NUMBER_DIGITS = 4;
export const MOBILE_NUMBER_PATTERN = '[0-9]{10}';

const { NEW, CONTACTED, QUALIFIED, WON, LOST } = LEAD_STATUSES;
const { HIGH, MEDIUM, LOW } = LEAD_PRIORITIES;

// Placeholder records until the leads API exists. Follow-up dates are ISO (YYYY-MM-DD).
// Formatting is skipped so each lead stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_LEADS = [
  lead(1, 'Vidya Vikas School Trust', 'Pratibha Gokhale', 'Referral', 'School fee collection software', 120000, null, 'rohan', HIGH, WON),
  lead(2, 'Sahyadri Multispeciality Clinic', 'Dr. Amol Shinde', 'Google', 'Payment gateway integration', 60000, null, 'sneha', MEDIUM, WON),
  lead(3, 'Nirmal Co-operative Credit Society', 'Suresh Pawar', 'Exhibition/Event', 'Custom API integration', 150000, null, 'rohan', HIGH, WON),
  lead(4, 'Konkan Fresh Mart', 'Fatima Dsouza', 'WhatsApp', 'Smart POS terminal', 75000, null, 'sneha', MEDIUM, WON),
  lead(5, 'Deccan Motors', 'Rajesh Jadhav', 'Website', 'Dealer management CRM', 45000, '2026-10-02', 'rohan', HIGH, QUALIFIED),
  lead(6, 'Pune Pharma Distributors', 'Meera Kulkarni', 'Referral', 'Billing and inventory software', 38000, '2026-09-30', 'sneha', MEDIUM, QUALIFIED),
  lead(7, 'Shivneri Hotels', 'Anil Bhosale', 'Google', 'Hotel POS and billing', 52000, '2026-10-05', 'rohan', MEDIUM, QUALIFIED),
  lead(8, 'Green Valley Organics', 'Kavita Deshmukh', 'Facebook', 'E-commerce payment gateway', 29000, '2026-09-28', 'sneha', LOW, QUALIFIED),
  lead(9, 'Aurangabad Auto Parts', 'Imran Shaikh', 'Cold call', 'GST billing software', 41000, '2026-09-30', 'rohan', MEDIUM, QUALIFIED),
  lead(10, 'Sai Krupa Jewellers', 'Prakash Sonar', 'Walk-in', 'Smart POS terminal', 35000, '2026-10-01', 'sneha', HIGH, CONTACTED),
  lead(11, 'Nashik Grape Exports', 'Sunil Gaikwad', 'Exhibition/Event', 'Export invoicing module', 24000, '2026-09-27', 'rohan', LOW, CONTACTED),
  lead(12, 'Bright Future Academy', 'Neha Joshi', 'Website', 'School fee collection software', 18000, '2026-10-03', 'sneha', MEDIUM, CONTACTED),
  lead(13, 'Kolhapur Dairy Co-op', 'Vilas Patil', 'Referral', 'Milk collection billing', 32000, '2026-10-06', 'rohan', MEDIUM, NEW),
  lead(14, 'Metro Diagnostics', 'Dr. Sameer Khan', 'Google', 'Payment gateway integration', 27000, '2026-10-07', 'sneha', MEDIUM, NEW),
  lead(15, 'Satara Hardware Mart', 'Ganesh More', 'WhatsApp', 'Smart POS terminal', 22000, null, null, LOW, NEW),
  lead(16, 'Om Sai Travels', 'Rahul Shinde', 'Facebook', 'Booking and payment links', 15000, null, null, MEDIUM, CONTACTED),
  lead(17, 'Western Ghats Resorts', 'Nikhil Rane', 'Exhibition/Event', 'Hotel POS and billing', 140000, null, 'vikram', HIGH, LOST),
  lead(18, 'Laxmi Textiles', 'Sunita Chavan', 'Cold call', 'GST billing software', 18600, null, 'vikram', LOW, LOST),
];

function lead(
  sequence,
  name,
  contactName,
  source,
  product,
  value,
  nextFollowUp,
  salespersonId,
  priority,
  status,
) {
  const paddedSequence = String(sequence).padStart(LEAD_NUMBER_DIGITS, '0');
  return {
    id: `lead-${sequence}`,
    number: `${LEAD_NUMBER_PREFIX}-2026-${paddedSequence}`,
    name,
    contactName,
    mobile: `98230${String(10000 + sequence)}`,
    source,
    product,
    value,
    nextFollowUp,
    salespersonId,
    priority,
    status,
  };
}
