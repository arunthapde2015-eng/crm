export const NAV_IDS = {
  DASHBOARD: 'dashboard',
  TASKS: 'tasks',
  MY_HR: 'my-hr',
  LEADS: 'leads',
  PIPELINE: 'pipeline',
  FOLLOW_UPS: 'follow-ups',
  CUSTOMERS: 'customers',
  QUOTATIONS: 'quotations',
  INCENTIVES: 'incentives',
  MERCHANTS: 'merchants',
  AMC_RENEWALS: 'amc-renewals',
  CALL_DESK: 'call-desk',
  SUPPORT_TICKETS: 'support-tickets',
  SETTINGS: 'settings',
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
    ],
  },
  {
    label: 'Sell',
    items: [
      { id: NAV_IDS.LEADS, label: 'Leads', badgeCount: 2 },
      { id: NAV_IDS.PIPELINE, label: 'Pipeline' },
      { id: NAV_IDS.FOLLOW_UPS, label: 'Follow-ups', badgeCount: 4 },
      { id: NAV_IDS.CUSTOMERS, label: 'Customers' },
      { id: NAV_IDS.QUOTATIONS, label: 'Quotations', badgeCount: 1 },
      { id: NAV_IDS.INCENTIVES, label: 'Incentives' },
    ],
  },
  {
    label: 'Merchants',
    items: [
      { id: NAV_IDS.MERCHANTS, label: 'Merchants' },
      { id: NAV_IDS.AMC_RENEWALS, label: 'AMC renewals', badgeCount: 3 },
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
    items: [{ id: NAV_IDS.SETTINGS, label: 'Settings' }],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);
