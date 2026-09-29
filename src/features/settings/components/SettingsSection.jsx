import { useId } from 'react';

import styles from './SettingsSection.module.css';

export function SettingsSection({ title, children }) {
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        {title}
      </h2>
      <div className={styles.grid}>{children}</div>
    </section>
  );
}
