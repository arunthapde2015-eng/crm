import { useEffect, useRef, useState } from 'react';

import logoUrl from '@/assets/logo.png';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { APP_NAME, APP_TAGLINE } from '@/constants/session';
import { useAuth } from '@/context/AuthContext';

import styles from './Auth.module.css';

/**
 * The one sign-in page for everyone. What they see afterwards depends on their role.
 *
 * @param {object} props
 * @param {Date} [props.now] - Injectable for tests.
 */
export function LoginPage({ now }) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [error, setError] = useState('');
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    if (username.trim() === '' || password === '') {
      setError('Enter your username and password.');
      return;
    }
    const message = signIn(username, password, now);
    setError(message);
    if (message) {
      // Clear the password so the next attempt starts fresh, and put the cursor back in it.
      setPassword('');
      passwordRef.current?.focus();
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img src={logoUrl} alt="" className={styles.logo} width="56" height="56" />
          <div>
            <p className={styles.appName}>{APP_NAME}</p>
            <p className={styles.tagline}>{APP_TAGLINE}</p>
          </div>
        </div>
        <h1 className={styles.title}>Sign in</h1>
        <form className={styles.form} onSubmit={handleSubmit} aria-label="Sign in" noValidate>
          <TextField
            ref={usernameRef}
            id="login-username"
            label="Username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <div className={styles.passwordField}>
            <TextField
              ref={passwordRef}
              id="login-password"
              label="Password"
              type={isPasswordShown ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className={styles.showPassword}
              aria-pressed={isPasswordShown}
              onClick={() => setIsPasswordShown((isShown) => !isShown)}
            >
              {isPasswordShown ? 'Hide' : 'Show'}
              <span className="visually-hidden"> password</span>
            </button>
          </div>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className={styles.submit}>
            Sign in
          </Button>
        </form>
        <p className={styles.help}>Forgot your password? Ask a Super Admin to reset it.</p>
      </div>
    </main>
  );
}
