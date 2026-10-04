import { NAV_GROUPS, NAV_IDS, NAV_ITEMS } from '@/constants/navigation';
import { ACCESS_LEVELS, INITIAL_ROLES } from '@/constants/roles';

import { canAccessNav, getAccessLevel, getAccessibleNavGroups, getHomeNavId } from './permissions';

const role = (id) => INITIAL_ROLES.find((item) => item.id === id);
const SUPER_ADMIN_MODULES = [
  'Dashboard',
  'User Management',
  'Role & Permission Management',
  'Lead Management',
  'Merchant Management',
  'Sales Management',
  'Quotation',
  'Proforma Invoice',
  'Sales Invoice',
  'Payment & Receipt',
  'AMC Management',
  'Expense Management',
  'Purchase Management',
  'Accounting',
  'Reports',
  'Notifications',
  'Settings',
  'Audit Logs',
];

describe('canAccessNav', () => {
  it('gives Super Admin access to every nav item', () => {
    NAV_ITEMS.forEach((item) => {
      expect(canAccessNav(role('super-admin'), item.id)).toBe(true);
    });
  });

  it('follows the role’s permissions, view-only included', () => {
    expect(getAccessLevel(role('sales-executive'), NAV_IDS.SALES)).toBe(ACCESS_LEVELS.VIEW);
    expect(canAccessNav(role('sales-executive'), NAV_IDS.SALES)).toBe(true);
    expect(canAccessNav(role('sales-executive'), NAV_IDS.USERS)).toBe(false);
  });

  it('denies everything when nobody is signed in', () => {
    expect(canAccessNav(null, NAV_IDS.DASHBOARD)).toBe(false);
  });
});

describe('getAccessibleNavGroups', () => {
  it('returns every group and module for Super Admin', () => {
    const groups = getAccessibleNavGroups(role('super-admin'));
    const labels = groups.flatMap((group) => group.items.map((item) => item.label));

    expect(groups).toEqual(NAV_GROUPS);
    expect(labels).toEqual(expect.arrayContaining(SUPER_ADMIN_MODULES));
  });

  it('shows only what the role can open, keeping Accounting as a sub-menu', () => {
    const groups = getAccessibleNavGroups(role('accountant'));
    const finance = groups.find((group) => group.label === 'Finance');

    expect(groups.map((group) => group.label)).toEqual([
      'Overview',
      'Billing',
      'Merchants',
      'Finance',
    ]);
    expect(finance.items.find((item) => item.label === 'Accounting').children).toHaveLength(7);
  });

  it('drops empty groups for roles without access', () => {
    expect(getAccessibleNavGroups(null)).toEqual([]);
  });
});

describe('getHomeNavId', () => {
  it('lands on the dashboard when the role has it, else the first page it can open', () => {
    expect(getHomeNavId(role('sales-manager'))).toBe(NAV_IDS.DASHBOARD);
    expect(getHomeNavId(role('sales-executive'))).toBe(NAV_IDS.TASKS);
  });
});
