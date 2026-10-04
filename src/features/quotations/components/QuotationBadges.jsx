import { BADGE_TONES, Badge } from '@/components/Badge';

import {
  APPROVAL_LABELS,
  APPROVAL_STATUSES,
  QUOTATION_STATUSES,
  QUOTATION_STATUS_LABELS,
} from '../constants';
import styles from './Quotations.module.css';

const STATUS_TONES = {
  [QUOTATION_STATUSES.DRAFT]: BADGE_TONES.INFO,
  [QUOTATION_STATUSES.SENT]: BADGE_TONES.WARNING,
  [QUOTATION_STATUSES.ACCEPTED]: BADGE_TONES.SUCCESS,
  [QUOTATION_STATUSES.REJECTED]: BADGE_TONES.DANGER,
  [QUOTATION_STATUSES.CONVERTED]: BADGE_TONES.SUCCESS,
  [QUOTATION_STATUSES.EXPIRED]: BADGE_TONES.NEUTRAL,
};

const APPROVAL_TONES = {
  [APPROVAL_STATUSES.PENDING]: BADGE_TONES.WARNING,
  [APPROVAL_STATUSES.APPROVED]: BADGE_TONES.SUCCESS,
  [APPROVAL_STATUSES.REJECTED]: BADGE_TONES.DANGER,
};

/** @param {{ status: string }} props - A display status (may be "expired"). */
export function QuotationStatusBadge({ status }) {
  return <Badge tone={STATUS_TONES[status]}>{QUOTATION_STATUS_LABELS[status]}</Badge>;
}

/** "Not needed" is plain text; anything that needs attention is a badge. */
export function ApprovalLabel({ approval }) {
  if (approval === APPROVAL_STATUSES.NOT_NEEDED) {
    return <span className={styles.muted}>{APPROVAL_LABELS[approval]}</span>;
  }
  return <Badge tone={APPROVAL_TONES[approval]}>{APPROVAL_LABELS[approval]}</Badge>;
}
