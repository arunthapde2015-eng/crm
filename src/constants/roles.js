import { ACCOUNTING_NAV_IDS, NAV_IDS } from './navigation';

export const ROLES = {
  SUPER_ADMIN: 'super-admin',
};

export const DASHBOARDS = { ADMIN: 'admin', STAFF: 'staff' };

export const DASHBOARD_LABELS = {
  [DASHBOARDS.ADMIN]: 'Admin Dashboard',
  [DASHBOARDS.STAFF]: 'Staff Dashboard',
};

export const ACCESS_LEVELS = { NONE: 'none', VIEW: 'view', FULL: 'full' };

export const ACCESS_LEVEL_LABELS = {
  [ACCESS_LEVELS.NONE]: 'No access',
  [ACCESS_LEVELS.VIEW]: 'View only',
  [ACCESS_LEVELS.FULL]: 'Full access',
};

const { VIEW, FULL } = ACCESS_LEVELS;
const EVERYONE = [NAV_IDS.TASKS, NAV_IDS.MY_HR, NAV_IDS.NOTIFICATIONS];

/** A permissions map: full access to some modules, view-only to others, nothing else. */
function access({ full = [], view = [] }) {
  return {
    ...Object.fromEntries([...EVERYONE, ...full].map((navId) => [navId, FULL])),
    ...Object.fromEntries(view.map((navId) => [navId, VIEW])),
  };
}

// Built-in roles. A role opens only the modules listed; Super Admin always has everything.
export const INITIAL_ROLES = [
  {
    id: ROLES.SUPER_ADMIN,
    name: 'Super Admin',
    dashboard: DASHBOARDS.ADMIN,
    description: 'Complete access, including users, roles and settings.',
    isSystem: true,
    permissions: {},
  },
  {
    id: 'sales-manager',
    name: 'Sales Manager',
    dashboard: DASHBOARDS.ADMIN,
    description: 'Runs the sales team: leads, quotations, invoices and targets.',
    isSystem: true,
    permissions: access({
      full: [
        NAV_IDS.DASHBOARD,
        NAV_IDS.REPORTS,
        NAV_IDS.LEADS,
        NAV_IDS.PIPELINE,
        NAV_IDS.FOLLOW_UPS,
        NAV_IDS.SALES,
        NAV_IDS.QUOTATIONS,
        NAV_IDS.INCENTIVES,
        NAV_IDS.PROFORMA_INVOICES,
        NAV_IDS.SALES_INVOICES,
        NAV_IDS.MERCHANTS,
        NAV_IDS.AMC_RENEWALS,
      ],
      view: [NAV_IDS.PAYMENTS_RECEIPTS, NAV_IDS.CALL_DESK, NAV_IDS.SUPPORT_TICKETS],
    }),
  },
  {
    id: 'sales-executive',
    name: 'Sales Executive',
    dashboard: DASHBOARDS.STAFF,
    description: 'Works their own leads, follow-ups and quotations.',
    isSystem: true,
    permissions: access({
      full: [NAV_IDS.LEADS, NAV_IDS.PIPELINE, NAV_IDS.FOLLOW_UPS, NAV_IDS.QUOTATIONS],
      view: [NAV_IDS.SALES, NAV_IDS.INCENTIVES, NAV_IDS.MERCHANTS, NAV_IDS.AMC_RENEWALS],
    }),
  },
  {
    id: 'accountant',
    name: 'Accountant',
    dashboard: DASHBOARDS.STAFF,
    description: 'Billing, receipts, expenses, purchases and the books.',
    isSystem: true,
    permissions: access({
      full: [
        NAV_IDS.PROFORMA_INVOICES,
        NAV_IDS.SALES_INVOICES,
        NAV_IDS.PAYMENTS_RECEIPTS,
        NAV_IDS.EXPENSES,
        NAV_IDS.PURCHASES,
        ...ACCOUNTING_NAV_IDS,
      ],
      view: [NAV_IDS.REPORTS, NAV_IDS.MERCHANTS, NAV_IDS.AMC_RENEWALS],
    }),
  },
  {
    id: 'support-caller',
    name: 'Support Caller',
    dashboard: DASHBOARDS.STAFF,
    description: 'Works the call desk and support tickets.',
    isSystem: true,
    permissions: access({
      full: [NAV_IDS.CALL_DESK, NAV_IDS.SUPPORT_TICKETS],
      view: [NAV_IDS.LEADS, NAV_IDS.MERCHANTS, NAV_IDS.AMC_RENEWALS],
    }),
  },
  {
    id: 'hr-manager',
    name: 'HR Manager',
    dashboard: DASHBOARDS.ADMIN,
    description: 'Attendance, leave and team records.',
    isSystem: true,
    permissions: access({ view: [NAV_IDS.DASHBOARD, NAV_IDS.REPORTS] }),
  },
];
