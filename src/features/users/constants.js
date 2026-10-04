import { ACCOUNTING_NAV_IDS, NAV_IDS } from '@/constants/navigation';

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

export const USER_STATUSES = { ACTIVE: 'active', DISABLED: 'disabled' };

export const USER_STATUS_LABELS = {
  [USER_STATUSES.ACTIVE]: 'Active',
  [USER_STATUSES.DISABLED]: 'Disabled',
};

export const SIGN_IN_EVENTS = {
  SIGNED_IN: 'Signed in',
  FAILED: 'Wrong password',
  PASSWORD_RESET: 'Password reset',
  USER_ADDED: 'User added',
};

export const TAB_IDS = {
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  ACTIVITY: 'activity',
};

export const TABS = [
  { id: TAB_IDS.USERS, label: 'Users' },
  { id: TAB_IDS.ROLES, label: 'Roles' },
  { id: TAB_IDS.PERMISSIONS, label: 'Role permissions' },
  { id: TAB_IDS.ACTIVITY, label: 'Sign-in activity' },
];

export const SUPER_ADMIN_ROLE_ID = 'super-admin';
export const USERNAME_PATTERN = /^[a-z][a-z0-9._]{2,19}$/;
// No look-alike characters (0/O, 1/l/I), so a password read out over the phone isn't misheard.
export const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
export const TEMPORARY_PASSWORD_LENGTH = 10;
export const MAX_DESCRIPTION_LENGTH = 200;

const { VIEW, FULL } = ACCESS_LEVELS;
const EVERYONE = [NAV_IDS.TASKS, NAV_IDS.MY_HR, NAV_IDS.NOTIFICATIONS];

/** A permissions map: full access to some modules, view-only to others, nothing else. */
function access({ full = [], view = [] }) {
  return {
    ...Object.fromEntries([...EVERYONE, ...full].map((navId) => [navId, FULL])),
    ...Object.fromEntries(view.map((navId) => [navId, VIEW])),
  };
}

// Built-in roles. Modules not listed have no access; Super Admin always has everything.
export const INITIAL_ROLES = [
  {
    id: SUPER_ADMIN_ROLE_ID,
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

const { ACTIVE } = USER_STATUSES;

// Placeholder users until sign-in is wired to an identity service.
// Formatting is skipped so each user stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_USERS = [
  user('admin', 'Anita Deshpande', 'anita@finsolis.in', SUPER_ADMIN_ROLE_ID, '2026-10-04T12:36'),
  user('vikram', 'Vikram Joshi', 'vikram@finsolis.in', 'sales-manager', null),
  user('rohan', 'Rohan Kulkarni', 'rohan@finsolis.in', 'sales-executive', null),
  user('sneha', 'Sneha Patil', 'sneha@finsolis.in', 'sales-executive', '2026-09-28T15:42'),
  user('meera', 'Meera Iyer', 'meera@finsolis.in', 'accountant', null),
  user('priya', 'Priya Sawant', 'priya@finsolis.in', 'support-caller', null),
  user('neha', 'Neha Joshi', 'neha@finsolis.in', 'hr-manager', null),
];

// prettier-ignore
export const INITIAL_ACTIVITY = [
  activity('act-4', '2026-10-04T12:36', 'admin', SIGN_IN_EVENTS.SIGNED_IN, 'Chrome on Windows'),
  activity('act-3', '2026-10-03T09:12', 'admin', SIGN_IN_EVENTS.SIGNED_IN, 'Chrome on Windows'),
  activity('act-2', '2026-09-28T15:42', 'sneha', SIGN_IN_EVENTS.SIGNED_IN, 'Chrome on Android'),
  activity('act-1', '2026-09-28T15:40', 'sneha', SIGN_IN_EVENTS.FAILED, 'Chrome on Android'),
];

function user(username, name, email, roleId, lastSignIn) {
  return {
    id: username,
    username,
    name,
    email,
    roleId,
    status: ACTIVE,
    lastSignIn,
    mustChangePassword: false,
  };
}

function activity(id, at, userId, event, detail) {
  return { id, at, userId, event, detail };
}
