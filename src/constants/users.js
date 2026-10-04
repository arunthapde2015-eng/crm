import { ROLES } from './roles';

export const USER_STATUSES = { ACTIVE: 'active', DISABLED: 'disabled' };

export const USER_STATUS_LABELS = {
  [USER_STATUSES.ACTIVE]: 'Active',
  [USER_STATUSES.DISABLED]: 'Disabled',
};

export const SIGN_IN_EVENTS = {
  SIGNED_IN: 'Signed in',
  SIGNED_OUT: 'Signed out',
  FAILED: 'Wrong password',
  LOCKED: 'Account locked',
  PASSWORD_CHANGED: 'Password changed',
  PASSWORD_RESET: 'Password reset',
  USER_ADDED: 'User added',
};

// Wrong passwords in a row before an account locks until a Super Admin resets its password.
export const MAX_FAILED_SIGN_INS = 5;
export const MIN_PASSWORD_LENGTH = 8;
export const USERNAME_PATTERN = /^[a-z][a-z0-9._]{2,19}$/;
// No look-alike characters (0/O, 1/l/I), so a password read out over the phone isn't misheard.
export const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
export const TEMPORARY_PASSWORD_LENGTH = 10;

// Demo accounts until sign-in moves to a server. Passwords live only in this browser's memory
// and are never shown; everyone except Anita and Sneha must set their own at first sign-in.
const ADMIN_PASSWORD = 'Admin@2026';
const STARTING_PASSWORD = 'Welcome@2026';
const { ACTIVE } = USER_STATUSES;

// Formatting is skipped so each user stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_USERS = [
  user('admin', 'Anita Deshpande', 'anita@finsolis.in', ROLES.SUPER_ADMIN, 'Director', '2026-10-04T12:36', ADMIN_PASSWORD, false),
  user('vikram', 'Vikram Joshi', 'vikram@finsolis.in', 'sales-manager', 'Sales Manager', null, STARTING_PASSWORD, true),
  user('rohan', 'Rohan Kulkarni', 'rohan@finsolis.in', 'sales-executive', 'Sales Executive', null, STARTING_PASSWORD, true),
  user('sneha', 'Sneha Patil', 'sneha@finsolis.in', 'sales-executive', 'Sales Executive', '2026-09-28T15:42', STARTING_PASSWORD, false),
  user('meera', 'Meera Iyer', 'meera@finsolis.in', 'accountant', 'Accountant', null, STARTING_PASSWORD, true),
  user('priya', 'Priya Sawant', 'priya@finsolis.in', 'support-caller', 'Support Executive', null, STARTING_PASSWORD, true),
  user('neha', 'Neha Joshi', 'neha@finsolis.in', 'hr-manager', 'HR Manager', null, STARTING_PASSWORD, true),
];

// prettier-ignore
export const INITIAL_ACTIVITY = [
  activity('act-4', '2026-10-04T12:36', 'admin', SIGN_IN_EVENTS.SIGNED_IN, 'Chrome on Windows'),
  activity('act-3', '2026-10-03T09:12', 'admin', SIGN_IN_EVENTS.SIGNED_IN, 'Chrome on Windows'),
  activity('act-2', '2026-09-28T15:42', 'sneha', SIGN_IN_EVENTS.SIGNED_IN, 'Chrome on Android'),
  activity('act-1', '2026-09-28T15:40', 'sneha', SIGN_IN_EVENTS.FAILED, 'Chrome on Android'),
];

function user(
  username,
  name,
  email,
  roleId,
  designation,
  lastSignIn,
  password,
  mustChangePassword,
) {
  return {
    id: username,
    username,
    name,
    email,
    roleId,
    designation,
    status: ACTIVE,
    lastSignIn,
    password,
    mustChangePassword,
    failedSignIns: 0,
    isLocked: false,
  };
}

function activity(id, at, userId, event, detail) {
  return { id, at, userId, event, detail };
}
