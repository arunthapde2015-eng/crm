import {
  INITIAL_USERS,
  MAX_FAILED_SIGN_INS,
  PASSWORD_ALPHABET,
  TEMPORARY_PASSWORD_LENGTH,
  USER_STATUSES,
} from '@/constants/users';

import {
  DISABLED_MESSAGE,
  LOCKED_MESSAGE,
  WRONG_CREDENTIALS,
  checkSignIn,
  describeDevice,
  generateTemporaryPassword,
  recordFailedSignIn,
  validateNewPassword,
} from './auth';

const rohan = INITIAL_USERS.find((user) => user.id === 'rohan');

describe('checkSignIn', () => {
  it('signs in with the right username (any case) and password', () => {
    expect(checkSignIn(INITIAL_USERS, ' Admin ', 'Admin@2026')).toMatchObject({
      user: { id: 'admin' },
      error: '',
    });
  });

  it('gives the same message for an unknown user and a wrong password', () => {
    expect(checkSignIn(INITIAL_USERS, 'nobody', 'x').error).toBe(WRONG_CREDENTIALS);
    expect(checkSignIn(INITIAL_USERS, 'admin', 'wrong').error).toBe(WRONG_CREDENTIALS);
  });

  it('only reveals a locked or disabled account once the password is right', () => {
    const users = [
      { ...rohan, isLocked: true },
      { ...rohan, id: 'neha', username: 'neha', status: USER_STATUSES.DISABLED },
    ];
    expect(checkSignIn(users, 'rohan', 'wrong').error).toBe(WRONG_CREDENTIALS);
    expect(checkSignIn(users, 'rohan', 'Welcome@2026').error).toBe(LOCKED_MESSAGE);
    expect(checkSignIn(users, 'neha', 'Welcome@2026').error).toBe(DISABLED_MESSAGE);
  });

  it('locks the account after too many wrong passwords', () => {
    let user = rohan;
    for (let attempt = 1; attempt < MAX_FAILED_SIGN_INS; attempt += 1) {
      user = recordFailedSignIn(user);
    }
    expect(user.isLocked).toBe(false);
    expect(recordFailedSignIn(user).isLocked).toBe(true);
  });
});

describe('passwords', () => {
  it('checks a chosen password', () => {
    expect(validateNewPassword('short', 'other', 'Welcome@2026')).toEqual([
      'Use at least 8 characters.',
      'Use both letters and numbers.',
      "The two passwords don't match.",
    ]);
    expect(validateNewPassword('Welcome@2026', 'Welcome@2026', 'Welcome@2026')).toEqual([
      'Choose a different password from the current one.',
    ]);
    expect(validateNewPassword('Rohan2026!', 'Rohan2026!', 'Welcome@2026')).toEqual([]);
  });

  it('makes temporary passwords without look-alike characters', () => {
    const password = generateTemporaryPassword();
    expect(password).toHaveLength(TEMPORARY_PASSWORD_LENGTH);
    expect([...password].every((character) => PASSWORD_ALPHABET.includes(character))).toBe(true);
  });

  it('describes the browser for the sign-in log', () => {
    expect(
      describeDevice('Mozilla/5.0 (Windows NT 10.0) AppleWebKit Chrome/129.0 Safari/537.36'),
    ).toBe('Chrome on Windows');
    expect(describeDevice('')).toBe('Browser on this device');
  });
});
