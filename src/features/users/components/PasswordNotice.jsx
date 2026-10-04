import { useEffect, useRef } from 'react';

import { Button } from '@/components/Button';

import styles from './Users.module.css';

/**
 * Shows a temporary password once. It isn't stored anywhere it can be shown again.
 *
 * @param {object} props
 * @param {string} props.userName
 * @param {string} props.password
 * @param {() => void} props.onDone
 */
export function PasswordNotice({ userName, password, onDone }) {
  const doneRef = useRef(null);

  useEffect(() => {
    doneRef.current?.focus();
  }, []);

  return (
    <section className={styles.notice} role="status" aria-label="Temporary password">
      <p className={styles.noticeText}>
        Temporary password for {userName}: <code className={styles.password}>{password}</code>
      </p>
      <p className={styles.formNote}>
        Share it privately. It won’t be shown again, and they’ll be asked to set a new password when
        they sign in.
      </p>
      <div>
        <Button ref={doneRef} variant="secondary" onClick={onDone}>
          Done
        </Button>
      </div>
    </section>
  );
}
