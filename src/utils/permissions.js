import { NAV_GROUPS, NAV_IDS, NAV_ITEMS } from '@/constants/navigation';
import { ACCESS_LEVELS, ROLES } from '@/constants/roles';

/**
 * What a role may do on a page: Super Admin always has full access; other roles have what's
 * set on them, or none. A missing role (not signed in) has no access to anything.
 *
 * @param {object | null} role - A role record, e.g. from INITIAL_ROLES.
 * @param {string} navId - One of NAV_IDS.
 */
export function getAccessLevel(role, navId) {
  if (!role) return ACCESS_LEVELS.NONE;
  if (role.id === ROLES.SUPER_ADMIN) return ACCESS_LEVELS.FULL;
  return role.permissions[navId] ?? ACCESS_LEVELS.NONE;
}

/** Whether the role may open the page at all (view-only counts). */
export function canAccessNav(role, navId) {
  return getAccessLevel(role, navId) !== ACCESS_LEVELS.NONE;
}

/** An item with only the sub-items the role may open, or null if it's left with nothing. */
function trimNavItem(role, item) {
  if (!item.children) return canAccessNav(role, item.id) ? item : null;
  const children = item.children.filter((child) => canAccessNav(role, child.id));
  return children.length > 0 ? { ...item, children } : null;
}

/**
 * NAV_GROUPS trimmed to the items (and sub-items) the role may open; groups left empty are dropped.
 *
 * @param {object | null} role
 */
export function getAccessibleNavGroups(role) {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => trimNavItem(role, item)).filter(Boolean),
  })).filter((group) => group.items.length > 0);
}

/** Where a user lands after signing in: the dashboard if they have it, else their first page. */
export function getHomeNavId(role) {
  if (canAccessNav(role, NAV_IDS.DASHBOARD)) return NAV_IDS.DASHBOARD;
  const firstPage = NAV_ITEMS.find((item) => !item.children && canAccessNav(role, item.id));
  return firstPage?.id ?? NAV_IDS.MY_HR;
}
