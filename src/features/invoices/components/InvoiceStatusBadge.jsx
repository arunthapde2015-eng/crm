import { BADGE_TONES, Badge } from '@/components/Badge';

import { INVOICE_STATUSES, INVOICE_STATUS_LABELS } from '../constants';

const TONES = {
  [INVOICE_STATUSES.DRAFT]: BADGE_TONES.INFO,
  [INVOICE_STATUSES.ISSUED]: BADGE_TONES.INFO,
  [INVOICE_STATUSES.PARTIALLY_PAID]: BADGE_TONES.WARNING,
  [INVOICE_STATUSES.PAID]: BADGE_TONES.SUCCESS,
  [INVOICE_STATUSES.OVERDUE]: BADGE_TONES.DANGER,
  [INVOICE_STATUSES.CANCELLED]: BADGE_TONES.DANGER,
};

/** @param {{ status: string }} props - A display status from getDisplayStatus. */
export function InvoiceStatusBadge({ status }) {
  return <Badge tone={TONES[status]}>{INVOICE_STATUS_LABELS[status]}</Badge>;
}
