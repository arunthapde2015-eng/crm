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

/**
 * NAV_GROUPS trimmed to the items the role may open; groups left empty are dropped.
 *
 * @param {string} role - One of ROLES.
 */
export function getAccessibleNavGroups(role) {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccessNav(role, item.id)),
  })).filter((group) => group.items.length > 0);
}
