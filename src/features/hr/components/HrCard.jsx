import { useId } from 'react';

import styles from './HrCard.module.css';

export function HrCard({ title, children }) {
  const headingId = useId();

  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        {title}
      </h2>
      {children}
    </section>
  );
}
