import { BADGE_TONES } from '@/components/Badge';
import { TEAM_MEMBERS } from '@/constants/team';

import { PRIORITIES, TICKET_STATUSES } from '../constants';

export const STATUS_TONES = {
  [TICKET_STATUSES.OPEN]: BADGE_TONES.WARNING,
  [TICKET_STATUSES.IN_PROGRESS]: BADGE_TONES.WARNING,
  [TICKET_STATUSES.WAITING]: BADGE_TONES.WARNING,
  [TICKET_STATUSES.RESOLVED]: BADGE_TONES.SUCCESS,
  [TICKET_STATUSES.CLOSED]: BADGE_TONES.NEUTRAL,
};

export const PRIORITY_TONES = {
  [PRIORITIES.HIGH]: BADGE_TONES.WARNING,
  [PRIORITIES.MEDIUM]: BADGE_TONES.INFO,
  [PRIORITIES.LOW]: BADGE_TONES.NEUTRAL,
};

export const ASSIGNEE_OPTIONS = [
  { value: '', label: 'Unassigned' },
  ...TEAM_MEMBERS.map((member) => ({ value: member.id, label: member.name })),
];
