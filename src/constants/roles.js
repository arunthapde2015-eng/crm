import { NAV_ITEMS } from './navigation';

export const ROLES = {
  SUPER_ADMIN: 'super-admin',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
};

// Nav ids each role may open. Super Admin has complete access, so it always tracks every nav item.
export const ROLE_NAV_ACCESS = {
  [ROLES.SUPER_ADMIN]: NAV_ITEMS.map((item) => item.id),
};
