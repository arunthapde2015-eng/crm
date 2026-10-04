import { NAV_GROUPS } from '@/constants/navigation';
import { EMAIL_PATTERN } from '@/constants/validation';
import { formatDayMonthYear, parseIsoDate, toIsoDate } from '@/utils/formatDate';

import {
  ACCESS_LEVELS,
  DASHBOARDS,
  PASSWORD_ALPHABET,
  SUPER_ADMIN_ROLE_ID,
  TEMPORARY_PASSWORD_LENGTH,
  USERNAME_PATTERN,
  USER_STATUSES,
} from '../constants';

const { ACTIVE, DISABLED } = USER_STATUSES;

/** "2026-10-04T12:36" → "04-10-2026 12:36"; never signed in → "Never". */
export function formatSignInTime(at) {
  if (!at) return 'Never';
  const [date, time] = at.split('T');
  return `${formatDayMonthYear(parseIsoDate(date))} ${time}`;
}

export function findRole(roles, roleId) {
  return roles.find((role) => role.id === roleId) ?? null;
}

export function findUser(users, userId) {
  return users.find((user) => user.id === userId) ?? null;
}

export function countUsers(users, roleId) {
  return users.filter((user) => user.roleId === roleId).length;
}

// ---- Modules -------------------------------------------------------------------

/** Every page a role can be given access to, with the menu section it sits in. */
export function getModules() {
  return NAV_GROUPS.flatMap((group) =>
    group.items.flatMap((item) =>
      item.children
        ? item.children.map((child) => ({ ...child, section: `${group.label} · ${item.label}` }))
        : [{ ...item, section: group.label }],
    ),
  );
}

/** Super Admin always has full access; other roles have what's set, or none. */
export function getAccessLevel(role, navId) {
  if (role.id === SUPER_ADMIN_ROLE_ID) return ACCESS_LEVELS.FULL;
  return role.permissions[navId] ?? ACCESS_LEVELS.NONE;
}

export function countModulesWithAccess(role) {
  return getModules().filter((module) => getAccessLevel(role, module.id) !== ACCESS_LEVELS.NONE)
    .length;
}

export function setAccessLevel(role, navId, level) {
  return { ...role, permissions: { ...role.permissions, [navId]: level } };
}

// ---- Users ---------------------------------------------------------------------

export function getEmptyUserValues() {
  return { name: '', email: '', username: '', roleId: '', status: ACTIVE };
}

export function getUserFormValues(user) {
  return {
    name: user.name,
    email: user.email,
    username: user.username,
    roleId: user.roleId,
    status: user.status,
  };
}

function isActiveSuperAdmin(user) {
  return user.roleId === SUPER_ADMIN_ROLE_ID && user.status === ACTIVE;
}

/** Changes that would leave nobody able to manage users, or lock you out, are refused. */
function getLockoutErrors(values, editingUser, users, currentUserId) {
  if (!editingUser) return [];
  const isLosingSuperAdmin =
    isActiveSuperAdmin(editingUser) &&
    (values.roleId !== SUPER_ADMIN_ROLE_ID || values.status === DISABLED);
  if (!isLosingSuperAdmin) return [];
  if (editingUser.id === currentUserId) {
    return ["You can't remove your own Super Admin access or disable yourself."];
  }
  const otherSuperAdmins = users.filter(
    (user) => user.id !== editingUser.id && isActiveSuperAdmin(user),
  );
  return otherSuperAdmins.length === 0 ? ['There must always be one active Super Admin.'] : [];
}

/**
 * Problems with a user, or [] if they can be saved. Usernames can't be changed after adding,
 * so they're only checked for new users.
 */
export function validateUser(values, users, roles, { editingUser = null, currentUserId }) {
  const errors = [];
  const email = values.email.trim().toLowerCase();
  const others = users.filter((user) => user.id !== editingUser?.id);

  if (values.name.trim() === '') errors.push('Enter the full name.');
  if (!EMAIL_PATTERN.test(email)) errors.push('Enter a valid email address.');
  else if (others.some((user) => user.email.toLowerCase() === email)) {
    errors.push('Another user already has this email.');
  }
  if (!editingUser) {
    const username = values.username.trim();
    if (!USERNAME_PATTERN.test(username)) {
      errors.push(
        'Username: 3 to 20 characters, starting with a letter; lowercase letters, numbers, dots or underscores.',
      );
    } else if (users.some((user) => user.username === username)) {
      errors.push(`The username ${username} is taken.`);
    }
  }
  if (!findRole(roles, values.roleId)) errors.push('Choose a role.');
  errors.push(...getLockoutErrors(values, editingUser, users, currentUserId));
  return errors;
}

/** New users start with a temporary password they must change when they first sign in. */
export function createUser(values) {
  const username = values.username.trim();
  return {
    id: username,
    username,
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    roleId: values.roleId,
    status: ACTIVE,
    lastSignIn: null,
    mustChangePassword: true,
  };
}

export function applyUserChanges(user, values) {
  return {
    ...user,
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    roleId: values.roleId,
    status: values.status,
  };
}

/** A random password from an alphabet without look-alike characters. */
export function generateTemporaryPassword() {
  const randomValues = crypto.getRandomValues(new Uint32Array(TEMPORARY_PASSWORD_LENGTH));
  return Array.from(
    randomValues,
    (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length],
  ).join('');
}

export function createActivity(now, userId, event, detail) {
  const at = `${toIsoDate(now)}T${now.toTimeString().slice(0, 5)}`;
  return { id: crypto.randomUUID(), at, userId, event, detail };
}

// ---- Roles ---------------------------------------------------------------------

export function getEmptyRoleValues() {
  return { name: '', dashboard: DASHBOARDS.STAFF, description: '', copyFromId: '' };
}

export function validateRole(values, roles) {
  const name = values.name.trim();
  if (name === '') return ['Enter the role name.'];
  if (roles.some((role) => role.name.toLowerCase() === name.toLowerCase())) {
    return [`A role called ${name} already exists.`];
  }
  return [];
}

/** A new role, starting with another role's permissions if one is chosen. */
export function createRole(values, roles) {
  const baseId = values.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const takenIds = new Set(roles.map((role) => role.id));
  let id = baseId;
  for (let suffix = 2; takenIds.has(id); suffix += 1) id = `${baseId}-${suffix}`;
  const source = findRole(roles, values.copyFromId);
  return {
    id,
    name: values.name.trim(),
    dashboard: values.dashboard,
    description: values.description.trim(),
    isSystem: false,
    permissions: source && source.id !== SUPER_ADMIN_ROLE_ID ? { ...source.permissions } : {},
  };
}

/** Why a role can't be deleted, or '' if it can. */
export function getDeleteRoleBlocker(role, users) {
  if (role.isSystem) return "Built-in roles can't be deleted.";
  const count = countUsers(users, role.id);
  if (count > 0)
    return `Move its ${count} ${count === 1 ? 'user' : 'users'} to another role first.`;
  return '';
}
