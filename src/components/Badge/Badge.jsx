import styles from './Badge.module.css';

export const BADGE_TONES = {
  INFO: 'info',
  NEUTRAL: 'neutral',
  ACCENT: 'accent',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
};

/**
 * Small pill label for a status or category.
 *
 * @param {object} props
 * @param {string} [props.tone='neutral'] - One of BADGE_TONES.
 * @param {React.ReactNode} props.children
 */
export function Badge({ tone = BADGE_TONES.NEUTRAL, children }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
