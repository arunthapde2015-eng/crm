import { MOBILE_PATTERN } from '@/constants/validation';
import { getDaysBetween } from '@/utils/dateRange';
import { formatCurrency } from '@/utils/formatCurrency';
import { addDays, formatDayMonthYear, parseIsoDate, toIsoDate } from '@/utils/formatDate';

import {
  CALL_DIRECTIONS,
  CALL_OUTCOMES,
  CALL_OUTCOME_LABELS,
  CONTACT_KINDS,
  QUEUE_CATEGORIES,
  QUEUE_SECTIONS,
  RETRY_OUTCOMES,
} from '../constants';

const { CALL_BACK, LEAD, AMC, PAYMENT } = QUEUE_CATEGORIES;
const formatDate = (isoDate) => formatDayMonthYear(parseIsoDate(isoDate));
const pluralDays = (days) => `${days} ${days === 1 ? 'day' : 'days'}`;

// ---- Queue ---------------------------------------------------------------------

function describeLastCall({ lastOutcome, lastCallDate }) {
  // Being asked to call back means the call got through.
  const outcome =
    lastOutcome === CALL_OUTCOMES.CALL_BACK
      ? 'connected'
      : CALL_OUTCOME_LABELS[lastOutcome].toLowerCase();
  return `Last call: ${outcome}, ${formatDate(lastCallDate)}`;
}

function describeAmc(due, note, todayIso) {
  const days = getDaysBetween(todayIso, due);
  let text = `AMC ends in ${pluralDays(days)}`;
  if (days < 0) text = `AMC expired ${pluralDays(-days)} ago`;
  else if (days === 0) text = 'AMC ends today';
  return note ? `${text}, ${note}` : text;
}

/** The "Why" column, built fresh so day counts stay right. */
export function getWhy(item, todayIso) {
  const { details } = item;
  switch (item.category) {
    case CALL_BACK:
      return `${details.isRequested ? 'Call back requested' : 'Try again'}. ${describeLastCall(details)}`;
    case LEAD: {
      const value = details.value ? `, ${formatCurrency(details.value)}` : '';
      return `${details.product}${value}. ${details.channel} planned`;
    }
    case AMC:
      return describeAmc(item.due, details.note, todayIso);
    case PAYMENT:
      return `${details.invoiceNumber}: ${formatCurrency(details.amount)} overdue since ${formatDate(item.due)}`;
    default:
      return '';
  }
}

export function isOverdue(item, todayIso) {
  return item.due < todayIso;
}

/** Queue sections in working order, each sorted by due date. Empty sections are kept. */
export function getQueueSections(queue) {
  return QUEUE_SECTIONS.map((section) => ({
    ...section,
    items: queue
      .filter((item) => item.category === section.id)
      .sort((first, second) => first.due.localeCompare(second.due)),
  }));
}

export function getSummary(queue, callLog, todayIso, userName) {
  const mineToday = callLog.filter((call) => call.by === userName && call.at.startsWith(todayIso));
  return {
    waiting: queue.length,
    loggedToday: mineToday.length,
    connectedToday: mineToday.filter((call) =>
      [CALL_OUTCOMES.CONNECTED, CALL_OUTCOMES.CALL_BACK].includes(call.outcome),
    ).length,
  };
}

// ---- Logging calls -------------------------------------------------------------

function getTomorrow(todayIso) {
  return toIsoDate(addDays(parseIsoDate(todayIso), 1));
}

/** Starting values: a queue call is outgoing to that contact; an ad-hoc one is incoming. */
export function getEmptyCallValues(todayIso, item = null) {
  return {
    name: item?.name ?? '',
    phone: item?.phone ?? '',
    direction: item ? CALL_DIRECTIONS.OUTGOING : CALL_DIRECTIONS.INCOMING,
    outcome: CALL_OUTCOMES.CONNECTED,
    callbackDate: getTomorrow(todayIso),
    notes: '',
  };
}

export function needsCallback(outcome) {
  return RETRY_OUTCOMES.includes(outcome);
}

export function validateCall(values, todayIso) {
  const errors = [];
  if (values.name.trim() === '') errors.push('Enter who the call was with.');
  if (!MOBILE_PATTERN.test(values.phone.trim())) errors.push('Enter a 10-digit phone number.');
  if (needsCallback(values.outcome)) {
    if (values.callbackDate === '') errors.push('Choose when to call back.');
    else if (values.callbackDate < todayIso) errors.push("The call-back can't be in the past.");
  }
  return errors;
}

/** "2026-10-04T10:30" for the call log, from the local clock. */
export function toLogTime(now) {
  const time = now.toTimeString().slice(0, 5);
  return `${toIsoDate(now)}T${time}`;
}

export function createLogEntry(values, now, by) {
  return {
    id: crypto.randomUUID(),
    at: toLogTime(now),
    name: values.name.trim(),
    phone: values.phone.trim(),
    direction: values.direction,
    outcome: values.outcome,
    notes: values.notes.trim(),
    by,
  };
}

/**
 * The queue after a call: the called item is done, and if the contact needs calling again a
 * call-back takes its place (replacing any call-back already queued for them).
 */
export function applyCallToQueue(queue, item, values, todayIso) {
  const name = values.name.trim();
  const phone = values.phone.trim();
  const remaining = queue.filter((queued) => queued.id !== item?.id);
  if (!needsCallback(values.outcome)) return remaining;

  const isSameContact = (queued) =>
    queued.category === CALL_BACK && queued.phone === phone && queued.name === name;
  return [
    ...remaining.filter((queued) => !isSameContact(queued)),
    {
      id: crypto.randomUUID(),
      category: CALL_BACK,
      name,
      kind: item?.kind ?? CONTACT_KINDS.OTHER,
      phone,
      due: values.callbackDate,
      details: {
        isRequested: values.outcome === CALL_OUTCOMES.CALL_BACK,
        lastOutcome: values.outcome,
        lastCallDate: todayIso,
      },
    },
  ];
}

// ---- New enquiries -------------------------------------------------------------

export function getEmptyEnquiryValues() {
  return { name: '', phone: '', product: '', value: '', notes: '' };
}

export function validateEnquiry(values) {
  const errors = [];
  if (values.name.trim() === '') errors.push('Enter the business or person enquiring.');
  if (!MOBILE_PATTERN.test(values.phone.trim())) errors.push('Enter a 10-digit phone number.');
  if (values.product.trim() === '') errors.push('Enter what they are interested in.');
  if (values.value !== '' && !(Number(values.value) >= 0)) {
    errors.push('Enter the estimated value as a number, or leave it blank.');
  }
  return errors;
}

/** An enquiry becomes a lead follow-up due today, and an incoming call in the log. */
export function createEnquiry(values, now, by) {
  const product = values.product.trim();
  const notes = values.notes.trim();
  return {
    queueItem: {
      id: crypto.randomUUID(),
      category: LEAD,
      name: values.name.trim(),
      kind: CONTACT_KINDS.LEAD,
      phone: values.phone.trim(),
      due: toIsoDate(now),
      details: { product, value: Number(values.value) || 0, channel: 'Call' },
    },
    logEntry: createLogEntry(
      {
        ...values,
        direction: CALL_DIRECTIONS.INCOMING,
        outcome: CALL_OUTCOMES.CONNECTED,
        notes: `New enquiry: ${product}${notes ? `. ${notes}` : ''}`,
      },
      now,
      by,
    ),
  };
}
