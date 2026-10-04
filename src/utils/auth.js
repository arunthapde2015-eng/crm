import {
  MAX_FAILED_SIGN_INS,
  MIN_PASSWORD_LENGTH,
  PASSWORD_ALPHABET,
  TEMPORARY_PASSWORD_LENGTH,
  USER_STATUSES,
} from '@/constants/users';

import { toIsoDate } from './formatDate';

// One message for an unknown username and a wrong password, so the form can't be used to find
// out which usernames exist.
export const WRONG_CREDENTIALS = 'Username or password is incorrect.';
export const LOCKED_MESSAGE = `This account is locked after ${MAX_FAILED_SIGN_INS} wrong passwords. Ask a Super Admin to reset your password.`;
export const DISABLED_MESSAGE = 'This account is disabled. Ask a Super Admin if you need access.';

/** "2026-10-04T12:36", from the local clock. */
export function toTimestamp(now) {
  return `${toIsoDate(now)}T${now.toTimeString().slice(0, 5)}`;
}

/**
 * Checks a sign-in attempt. Returns the matched user (if the username exists) and either an error
 * or nothing. A locked or disabled account is only reported once the password is right, so
 * those messages can't reveal anything to someone guessing.
 */
export function checkSignIn(users, username, password) {
  const user = users.find((item) => item.username === username.trim().toLowerCase()) ?? null;
  if (!user) return { user: null, error: WRONG_CREDENTIALS };
  if (user.password !== password) return { user, error: WRONG_CREDENTIALS };
  // Even with the right password, a locked account stays locked until a Super Admin resets it.
  if (user.isLocked) return { user, error: LOCKED_MESSAGE };
  if (user.status === USER_STATUSES.DISABLED) return { user, error: DISABLED_MESSAGE };
  return { user, error: '' };
}

/** The user after a wrong password: counts it, and locks the account at the limit. */
export function recordFailedSignIn(user) {
  const failedSignIns = user.failedSignIns + 1;
  return { ...user, failedSignIns, isLocked: failedSignIns >= MAX_FAILED_SIGN_INS };
}

export function recordSignIn(user, now) {
  return { ...user, failedSignIns: 0, lastSignIn: toTimestamp(now) };
}

/** Rules for a password someone chooses themselves. */
export function validateNewPassword(password, confirmation, currentPassword) {
  const errors = [];
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.push('Use both letters and numbers.');
  }
  if (password === currentPassword) {
    errors.push('Choose a different password from the current one.');
  }
  if (password !== confirmation) errors.push("The two passwords don't match.");
  return errors;
}

/** A random password from an alphabet without look-alike characters. */
export function generateTemporaryPassword() {
  const randomValues = crypto.getRandomValues(new Uint32Array(TEMPORARY_PASSWORD_LENGTH));
  return Array.from(
    randomValues,
    (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length],
  ).join('');
}

/** A short description of this browser for the sign-in log, e.g. "Chrome on Windows". */
export function describeDevice(userAgent = globalThis.navigator?.userAgent ?? '') {
  const browser =
    [
      ['Edg/', 'Edge'],
      ['Chrome/', 'Chrome'],
      ['Firefox/', 'Firefox'],
      ['Safari/', 'Safari'],
    ].find(([token]) => userAgent.includes(token))?.[1] ?? 'Browser';
  const system =
    [
      ['Android', 'Android'],
      ['iPhone', 'iPhone'],
      ['Windows', 'Windows'],
      ['Mac OS', 'Mac'],
      ['Linux', 'Linux'],
    ].find(([token]) => userAgent.includes(token))?.[1] ?? 'this device';
  return `${browser} on ${system}`;
}
