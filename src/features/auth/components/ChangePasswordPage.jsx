import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { MIN_PASSWORD_LENGTH } from '@/constants/users';
import { useAuth } from '@/context/AuthContext';
import { validateNewPassword } from '@/utils/auth';

import styles from './Auth.module.css';

/**
 * Shown after signing in with a temporary password: the user must choose their own first.
 *
 * @param {object} props
 * @param {Date} [props.now] - Injectable for tests.
 */
export function ChangePasswordPage({ now }) {
  const { currentUser, changeOwnPassword, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState([]);
  const passwordRef = useRef(null);

  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateNewPassword(password, confirmation, currentUser.password);
    setErrors(validationErrors);
    if (validationErrors.length === 0) changeOwnPassword(password, now);
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Set your password</h1>
        <p className={styles.intro}>
          Welcome, {currentUser.name}. You signed in with a temporary password, so choose your own
          before you continue.
        </p>
        <form
          className={styles.form}
          onSubmit={handleSubmit}
          aria-label="Set your password"
          noValidate
        >
          <TextField
            ref={passwordRef}
            id="new-password"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors([]);
            }}
          />
          <TextField
            id="confirm-password"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value);
              setErrors([]);
            }}
          />
          <p className={styles.help}>
            At least {MIN_PASSWORD_LENGTH} characters, with letters and numbers.
          </p>
          {errors.length > 0 && (
            <ul className={styles.error} role="alert">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
          <Button type="submit" className={styles.submit}>
            Save password
          </Button>
        </form>
        <button type="button" className={styles.linkButton} onClick={() => signOut(now)}>
          Sign out instead
        </button>
      </div>
    </main>
  );
}
