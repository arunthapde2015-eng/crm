export const NAV_IDS = {
  DASHBOARD: 'dashboard',
  TASKS: 'tasks',
  MY_HR: 'my-hr',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  LEADS: 'leads',
  PIPELINE: 'pipeline',
  FOLLOW_UPS: 'follow-ups',
  CUSTOMERS: 'customers',
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
  CALL_DESK: 'call-desk',
  SUPPORT_TICKETS: 'support-tickets',
  USERS: 'users',
  ROLES_PERMISSIONS: 'roles-permissions',
  SETTINGS: 'settings',
  AUDIT_LOGS: 'audit-logs',
};

export const DEFAULT_NAV_ID = NAV_IDS.SETTINGS;

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
      { id: NAV_IDS.CUSTOMERS, label: 'Customer Management' },
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
      { id: NAV_IDS.ACCOUNTING, label: 'Accounting' },
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

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);
