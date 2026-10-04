export const NAV_IDS = {
  DASHBOARD: 'dashboard',
  TASKS: 'tasks',
  MY_HR: 'my-hr',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  LEADS: 'leads',
  PIPELINE: 'pipeline',
  FOLLOW_UPS: 'follow-ups',
  SALES: 'sales',
  QUOTATIONS: 'quotations',
  INCENTIVES: 'incentives',
  PROFORMA_INVOICES: 'proforma-invoices',
  SALES_INVOICES: 'sales-invoices',
  PAYMENTS_RECEIPTS: 'payments-receipts',
  MERCHANTS: 'merchants',
  AMC_RENEWALS: 'amc-renewals',
  EXPENSES: 'expenses',
  PURCHASES: 'purchases',
  ACCOUNTING: 'accounting',
  VOUCHERS: 'vouchers',
  LEDGERS: 'ledgers',
  TRIAL_BALANCE: 'trial-balance',
  INCOME_GL: 'income-gl',
  EXPENSE_GL: 'expense-gl',
  BANK_BOOK: 'bank-book',
  BANKS: 'banks',
  CALL_DESK: 'call-desk',
  SUPPORT_TICKETS: 'support-tickets',
  USERS: 'users',
  ROLES_PERMISSIONS: 'roles-permissions',
  SETTINGS: 'settings',
  AUDIT_LOGS: 'audit-logs',
};

// Accounting's sub-menu. All of these pages work from the same vouchers and bank accounts.
const ACCOUNTING_ITEMS = [
  { id: NAV_IDS.VOUCHERS, label: 'Vouchers' },
  { id: NAV_IDS.LEDGERS, label: 'Ledgers' },
  { id: NAV_IDS.TRIAL_BALANCE, label: 'Trial balance, P&L' },
  { id: NAV_IDS.INCOME_GL, label: 'Income GL' },
  { id: NAV_IDS.EXPENSE_GL, label: 'Expense GL' },
  { id: NAV_IDS.BANK_BOOK, label: 'Bank GL & bank book' },
  { id: NAV_IDS.BANKS, label: 'Manage banks' },
];

// Badge counts are placeholders until each module exposes its own pending count.
export const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { id: NAV_IDS.DASHBOARD, label: 'Dashboard' },
      { id: NAV_IDS.TASKS, label: 'Tasks', badgeCount: 2 },
      { id: NAV_IDS.MY_HR, label: 'My HR' },
      { id: NAV_IDS.NOTIFICATIONS, label: 'Notifications' },
      { id: NAV_IDS.REPORTS, label: 'Reports' },
    ],
  },
  {
    label: 'Sell',
    items: [
      { id: NAV_IDS.LEADS, label: 'Lead Management', badgeCount: 2 },
      { id: NAV_IDS.PIPELINE, label: 'Pipeline' },
      { id: NAV_IDS.FOLLOW_UPS, label: 'Follow-ups', badgeCount: 4 },
      { id: NAV_IDS.SALES, label: 'Sales Management' },
      { id: NAV_IDS.QUOTATIONS, label: 'Quotation', badgeCount: 1 },
      { id: NAV_IDS.INCENTIVES, label: 'Incentives' },
    ],
  },
  {
    label: 'Billing',
    items: [
      { id: NAV_IDS.PROFORMA_INVOICES, label: 'Proforma Invoice' },
      { id: NAV_IDS.SALES_INVOICES, label: 'Sales Invoice' },
      { id: NAV_IDS.PAYMENTS_RECEIPTS, label: 'Payment & Receipt' },
    ],
  },
  {
    label: 'Merchants',
    items: [
      { id: NAV_IDS.MERCHANTS, label: 'Merchant Management' },
      { id: NAV_IDS.AMC_RENEWALS, label: 'AMC Management', badgeCount: 3 },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: NAV_IDS.EXPENSES, label: 'Expense Management' },
      { id: NAV_IDS.PURCHASES, label: 'Purchase Management' },
      { id: NAV_IDS.ACCOUNTING, label: 'Accounting', children: ACCOUNTING_ITEMS },
    ],
  },
  {
    label: 'Support',
    items: [
      { id: NAV_IDS.CALL_DESK, label: 'Call desk', badgeCount: 10 },
      { id: NAV_IDS.SUPPORT_TICKETS, label: 'Support tickets' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: NAV_IDS.USERS, label: 'User Management' },
      { id: NAV_IDS.ROLES_PERMISSIONS, label: 'Role & Permission Management' },
      { id: NAV_IDS.SETTINGS, label: 'Settings' },
      { id: NAV_IDS.AUDIT_LOGS, label: 'Audit Logs' },
    ],
  },
];

// Every item including sub-items, for access checks and page titles. A parent with sub-items only
// opens and closes its sub-menu; it isn't a page of its own.
export const NAV_ITEMS = NAV_GROUPS.flatMap((group) =>
  group.items.flatMap((item) => [item, ...(item.children ?? [])]),
);

export const ACCOUNTING_NAV_IDS = ACCOUNTING_ITEMS.map((item) => item.id);
