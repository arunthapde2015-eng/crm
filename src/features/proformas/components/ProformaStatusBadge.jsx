import { BADGE_TONES, Badge } from '@/components/Badge';

import { PROFORMA_STATUSES, PROFORMA_STATUS_LABELS } from '../constants';

const TONES = {
  [PROFORMA_STATUSES.ISSUED]: BADGE_TONES.INFO,
  [PROFORMA_STATUSES.CONVERTED]: BADGE_TONES.SUCCESS,
  [PROFORMA_STATUSES.CANCELLED]: BADGE_TONES.DANGER,
  [PROFORMA_STATUSES.EXPIRED]: BADGE_TONES.NEUTRAL,
};

/** @param {{ status: string }} props - A display status (may be "expired"). */
export function ProformaStatusBadge({ status }) {
  return <Badge tone={TONES[status]}>{PROFORMA_STATUS_LABELS[status]}</Badge>;
}
