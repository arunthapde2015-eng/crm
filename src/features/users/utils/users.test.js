import { NAV_IDS } from '@/constants/navigation';

import {
  ACCESS_LEVELS,
  INITIAL_ROLES,
  INITIAL_USERS,
  PASSWORD_ALPHABET,
  TEMPORARY_PASSWORD_LENGTH,
  USER_STATUSES,
} from '../constants';
import {
  countModulesWithAccess,
  createRole,
  createUser,
  findRole,
  formatSignInTime,
  generateTemporaryPassword,
  getAccessLevel,
  getDeleteRoleBlocker,
  getEmptyUserValues,
  getModules,
  getUserFormValues,
  validateRole,
  validateUser,
} from './users';

const role = (id) => findRole(INITIAL_ROLES, id);
const user = (id) => INITIAL_USERS.find((item) => item.id === id);
const context = { currentUserId: 'admin' };

describe('users', () => {
  it('formats sign-in times', () => {
    expect(formatSignInTime('2026-10-04T12:36')).toBe('04-10-2026 12:36');
    expect(formatSignInTime(null)).toBe('Never');
  });

  it('checks a new user', () => {
    const values = {
      ...getEmptyUserValues(),
      name: 'Kiran More',
      email: 'SNEHA@finsolis.in',
      username: 'Sneha',
      roleId: '',
    };
    expect(validateUser(values, INITIAL_USERS, INITIAL_ROLES, context)).toEqual([
      'Another user already has this email.',
      'Username: 3 to 20 characters, starting with a letter; lowercase letters, numbers, dots or underscores.',
      'Choose a role.',
    ]);
    expect(
      validateUser(
        { ...values, email: 'kiran@finsolis.in', username: 'sneha', roleId: 'accountant' },
        INITIAL_USERS,
        INITIAL_ROLES,
        context,
      ),
    ).toEqual(['The username sneha is taken.']);
  });

  it('never leaves the system without an active Super Admin', () => {
    const anita = user('admin');
    expect(
      validateUser(
        { ...getUserFormValues(anita), status: USER_STATUSES.DISABLED },
        INITIAL_USERS,
        INITIAL_ROLES,
        { ...context, editingUser: anita },
      ),
    ).toEqual(["You can't remove your own Super Admin access or disable yourself."]);
    expect(
      validateUser(
        { ...getUserFormValues(anita), roleId: 'accountant' },
        INITIAL_USERS,
        INITIAL_ROLES,
        { currentUserId: 'vikram', editingUser: anita },
      ),
    ).toEqual(['There must always be one active Super Admin.']);
  });

  it('adds users needing a new password', () => {
    expect(
      createUser({
        name: ' Kiran More ',
        email: 'Kiran@Finsolis.in',
        username: 'kiran',
        roleId: 'accountant',
      }),
    ).toMatchObject({
      id: 'kiran',
      email: 'kiran@finsolis.in',
      lastSignIn: null,
      mustChangePassword: true,
    });
  });

  it('makes temporary passwords without look-alike characters', () => {
    const password = generateTemporaryPassword();
    expect(password).toHaveLength(TEMPORARY_PASSWORD_LENGTH);
    expect([...password].every((character) => PASSWORD_ALPHABET.includes(character))).toBe(true);
  });
});

describe('roles and permissions', () => {
  it('gives Super Admin everything and others only what is set', () => {
    expect(getAccessLevel(role('super-admin'), NAV_IDS.BANKS)).toBe(ACCESS_LEVELS.FULL);
    expect(getAccessLevel(role('sales-executive'), NAV_IDS.LEADS)).toBe(ACCESS_LEVELS.FULL);
    expect(getAccessLevel(role('sales-executive'), NAV_IDS.SALES)).toBe(ACCESS_LEVELS.VIEW);
    expect(getAccessLevel(role('sales-executive'), NAV_IDS.BANKS)).toBe(ACCESS_LEVELS.NONE);
    expect(countModulesWithAccess(role('super-admin'))).toBe(getModules().length);
  });

  it('lists accounting pages as modules, not the Accounting menu itself', () => {
    const ids = getModules().map((module) => module.id);
    expect(ids).toContain(NAV_IDS.VOUCHERS);
    expect(ids).not.toContain(NAV_IDS.ACCOUNTING);
  });

  it('creates a role from a copy and blocks deleting roles in use', () => {
    expect(validateRole({ name: 'accountant' }, INITIAL_ROLES)).toEqual([
      'A role called accountant already exists.',
    ]);
    const custom = createRole(
      {
        name: 'Field Technician',
        dashboard: 'staff',
        description: '',
        copyFromId: 'support-caller',
      },
      INITIAL_ROLES,
    );
    expect(custom).toMatchObject({ id: 'field-technician', isSystem: false });
    expect(getAccessLevel(custom, NAV_IDS.CALL_DESK)).toBe(ACCESS_LEVELS.FULL);
    expect(getDeleteRoleBlocker(custom, INITIAL_USERS)).toBe('');
    expect(getDeleteRoleBlocker(custom, [{ id: 'x', roleId: 'field-technician' }])).toBe(
      'Move its 1 user to another role first.',
    );
    expect(getDeleteRoleBlocker(role('accountant'), INITIAL_USERS)).toBe(
      "Built-in roles can't be deleted.",
    );
  });
});
