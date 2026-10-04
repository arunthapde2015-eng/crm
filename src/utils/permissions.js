import { NAV_GROUPS } from '@/constants/navigation';
import { ROLE_NAV_ACCESS } from '@/constants/roles';

/**
 * @param {string} role - One of ROLES.
 * @param {string} navId - One of NAV_IDS.
 * @returns {boolean} Whether the role may open that page. Unknown roles get no access.
 */
export function canAccessNav(role, navId) {
  return ROLE_NAV_ACCESS[role]?.includes(navId) ?? false;
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
 * @param {string} role - One of ROLES.
 */
export function getAccessibleNavGroups(role) {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => trimNavItem(role, item)).filter(Boolean),
  })).filter((group) => group.items.length > 0);
}
