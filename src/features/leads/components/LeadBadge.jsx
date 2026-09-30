import {
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from '../constants';

import styles from './LeadBadge.module.css';

const PRIORITY_TONES = {
  [LEAD_PRIORITIES.HIGH]: styles.warning,
  [LEAD_PRIORITIES.MEDIUM]: styles.info,
  [LEAD_PRIORITIES.LOW]: styles.neutral,
};

const STATUS_TONES = {
  [LEAD_STATUSES.NEW]: styles.info,
  [LEAD_STATUSES.CONTACTED]: styles.neutral,
  [LEAD_STATUSES.QUALIFIED]: styles.accent,
  [LEAD_STATUSES.WON]: styles.success,
  [LEAD_STATUSES.LOST]: styles.danger,
};

export function PriorityBadge({ priority }) {
  return (
    <span className={`${styles.badge} ${PRIORITY_TONES[priority]}`}>
      {LEAD_PRIORITY_LABELS[priority]}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${STATUS_TONES[status]}`}>{LEAD_STATUS_LABELS[status]}</span>
  );
}
