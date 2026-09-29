import { NAV_GROUPS, NAV_IDS, NAV_ITEMS } from '@/constants/navigation';
import { ROLES } from '@/constants/roles';

import { canAccessNav, getAccessibleNavGroups } from './permissions';

const SUPER_ADMIN_MODULES = [
  'Dashboard',
  'User Management',
  'Role & Permission Management',
  'Lead Management',
  'Customer Management',
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
      expect(canAccessNav(ROLES.SUPER_ADMIN, item.id)).toBe(true);
    });
  });

  it('denies unknown roles', () => {
    expect(canAccessNav('guest', NAV_IDS.DASHBOARD)).toBe(false);
  });
});

describe('getAccessibleNavGroups', () => {
  it('returns every group and module for Super Admin', () => {
    const groups = getAccessibleNavGroups(ROLES.SUPER_ADMIN);
    const labels = groups.flatMap((group) => group.items.map((item) => item.label));

    expect(groups).toEqual(NAV_GROUPS);
    expect(labels).toEqual(expect.arrayContaining(SUPER_ADMIN_MODULES));
  });

  it('drops empty groups for roles without access', () => {
    expect(getAccessibleNavGroups('guest')).toEqual([]);
  });
});
