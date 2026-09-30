import { addDays, toIsoDate } from '@/utils/formatDate';

import { FOLLOW_UP_GROUP_IDS, FOLLOW_UP_GROUPS } from '../constants';

function getGroupId(dueDate, todayIsoDate, tomorrowIsoDate) {
  // ISO dates compare correctly as strings.
  if (dueDate < todayIsoDate) return FOLLOW_UP_GROUP_IDS.OVERDUE;
  if (dueDate === todayIsoDate) return FOLLOW_UP_GROUP_IDS.TODAY;
  if (dueDate === tomorrowIsoDate) return FOLLOW_UP_GROUP_IDS.TOMORROW;
  return FOLLOW_UP_GROUP_IDS.LATER;
}

function compareByDueTime(first, second) {
  return `${first.dueDate}T${first.dueTime}`.localeCompare(`${second.dueDate}T${second.dueTime}`);
}

/**
 * Splits follow-ups into Overdue / Today / Tomorrow / Later, earliest first within each.
 * Every group is returned, including empty ones.
 *
 * @param {object[]} followUps
 * @param {Date} today
 */
export function groupFollowUps(followUps, today) {
  const todayIsoDate = toIsoDate(today);
  const tomorrowIsoDate = toIsoDate(addDays(today, 1));

  return FOLLOW_UP_GROUPS.map((group) => ({
    ...group,
    followUps: followUps
      .filter((item) => getGroupId(item.dueDate, todayIsoDate, tomorrowIsoDate) === group.id)
      .sort(compareByDueTime),
  }));
}

/** "2 overdue, 2 due today." */
export function getFollowUpSummary(groups) {
  const countOf = (groupId) => groups.find((group) => group.id === groupId).followUps.length;
  return `${countOf(FOLLOW_UP_GROUP_IDS.OVERDUE)} overdue, ${countOf(FOLLOW_UP_GROUP_IDS.TODAY)} due today.`;
}

/**
 * Records what was discussed and reschedules the next follow-up.
 *
 * @param {object} followUp
 * @param {{ type: string, discussion: string, nextDate: string, nextTime: string }} log
 */
export function applyFollowUpLog(followUp, { type, discussion, nextDate, nextTime }) {
  return {
    ...followUp,
    type,
    lastDiscussion: discussion.trim(),
    dueDate: nextDate,
    dueTime: nextTime,
  };
}
