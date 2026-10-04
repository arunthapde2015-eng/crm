import styles from './Incentives.module.css';

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

/**
 * Initials avatar, name and job title.
 *
 * @param {{ name: string, designation?: string }} props
 */
export function PersonCell({ name, designation }) {
  return (
    <span className={styles.person}>
      <span className={styles.avatar} aria-hidden="true">
        {getInitials(name)}
      </span>
      <span>{name}</span>
      {designation && <span className={styles.secondary}>{designation}</span>}
    </span>
  );
}
