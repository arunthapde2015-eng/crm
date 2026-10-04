import { TEAM_MEMBER_NAMES } from '@/constants/team';
import { MOBILE_PATTERN } from '@/constants/validation';
import { getNextDocumentNumber } from '@/utils/documentNumber';
import { addDays, parseIsoDate, toIsoDate } from '@/utils/formatDate';

import {
  ACTIVE_STATUSES,
  ALL_FILTER_VALUE,
  PRIORITIES,
  PRIORITY_RANK,
  RESPONSE_DAYS,
  TICKET_CATEGORIES,
  TICKET_NUMBER_PREFIX,
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
  UNASSIGNED_VALUE,
} from '../constants';

const { OPEN, RESOLVED, CLOSED } = TICKET_STATUSES;

export function isActive(ticket) {
  return ACTIVE_STATUSES.includes(ticket.status);
}

/** Only tickets still being worked on can be past due. */
export function isPastDue(ticket, todayIso) {
  return isActive(ticket) && ticket.due < todayIso;
}

export function getDueDate(raisedOnIso, priority) {
  return toIsoDate(addDays(parseIsoDate(raisedOnIso), RESPONSE_DAYS[priority]));
}

export function getAssigneeName(ticket) {
  return TEAM_MEMBER_NAMES.get(ticket.assigneeId) ?? 'Unassigned';
}

// ---- Lists ---------------------------------------------------------------------

function matchesFilters(ticket, { query, status, priority, category, assignee }) {
  const searchable = [ticket.number, ticket.subject, ticket.customer, ticket.phone, ticket.category]
    .join(' ')
    .toLowerCase();
  // Closed tickets only show when asked for by status.
  const matchesStatus =
    status === ALL_FILTER_VALUE ? ticket.status !== CLOSED : ticket.status === status;
  const assigneeId = assignee === UNASSIGNED_VALUE ? '' : assignee;
  return (
    searchable.includes(query.trim().toLowerCase()) &&
    matchesStatus &&
    (priority === ALL_FILTER_VALUE || ticket.priority === priority) &&
    (category === ALL_FILTER_VALUE || ticket.category === category) &&
    (assignee === ALL_FILTER_VALUE || ticket.assigneeId === assigneeId)
  );
}

/** Tickets being worked on come first, soonest due and most urgent at the top. */
function compareTickets(first, second) {
  const activeOrder = Number(isActive(second)) - Number(isActive(first));
  if (activeOrder !== 0) return activeOrder;
  if (!isActive(first)) return second.raisedOn.localeCompare(first.raisedOn);
  return (
    first.due.localeCompare(second.due) ||
    PRIORITY_RANK[second.priority] - PRIORITY_RANK[first.priority] ||
    first.number.localeCompare(second.number)
  );
}

export function filterTickets(tickets, filters) {
  return tickets.filter((ticket) => matchesFilters(ticket, filters)).sort(compareTickets);
}

export function getStatusCounts(tickets) {
  return Object.fromEntries(
    Object.values(TICKET_STATUSES).map((status) => [
      status,
      tickets.filter((ticket) => ticket.status === status).length,
    ]),
  );
}

export function getSummary(tickets, todayIso, userName) {
  const active = tickets.filter(isActive);
  return {
    open: active.length,
    pastDue: active.filter((ticket) => isPastDue(ticket, todayIso)).length,
    assignedToYou: active.filter((ticket) => getAssigneeName(ticket) === userName).length,
  };
}

// ---- Raising -------------------------------------------------------------------

export function getEmptyTicketValues() {
  return {
    customer: '',
    phone: '',
    subject: '',
    category: TICKET_CATEGORIES[0],
    priority: PRIORITIES.MEDIUM,
    assigneeId: '',
    description: '',
  };
}

export function validateTicket(values) {
  const errors = [];
  const phone = values.phone.trim();
  if (values.customer.trim() === '') errors.push('Enter the merchant or customer.');
  if (phone !== '' && !MOBILE_PATTERN.test(phone)) errors.push('Enter a 10-digit phone number.');
  if (values.subject.trim() === '') errors.push('Enter a subject.');
  if (values.description.trim() === '') errors.push('Describe the problem.');
  return errors;
}

function createUpdate(todayIso, by, note, status) {
  return { id: crypto.randomUUID(), date: todayIso, by, note, status };
}

export function createTicket(values, tickets, todayIso, by) {
  const number = getNextDocumentNumber(
    tickets.map((ticket) => ticket.number),
    TICKET_NUMBER_PREFIX,
    todayIso,
  );
  return {
    id: number,
    number,
    raisedOn: todayIso,
    due: getDueDate(todayIso, values.priority),
    subject: values.subject.trim(),
    customer: values.customer.trim(),
    phone: values.phone.trim(),
    category: values.category,
    priority: values.priority,
    assigneeId: values.assigneeId,
    status: OPEN,
    description: values.description.trim(),
    updates: [createUpdate(todayIso, by, 'Ticket raised.', OPEN)],
  };
}

// ---- Updating ------------------------------------------------------------------

export function getUpdateFormValues(ticket) {
  return { status: ticket.status, assigneeId: ticket.assigneeId, note: '' };
}

/** An update must change something; resolving needs a note on what fixed it. */
export function validateUpdate(values, ticket) {
  const note = values.note.trim();
  const hasChange =
    values.status !== ticket.status || values.assigneeId !== ticket.assigneeId || note !== '';
  if (!hasChange) return ['Change the status or assignee, or add a note.'];
  if (values.status === RESOLVED && ticket.status !== RESOLVED && note === '') {
    return ['Add a note on how it was resolved.'];
  }
  return [];
}

/** The ticket with the changes applied and an entry in its history describing them. */
export function applyUpdate(ticket, values, todayIso, by) {
  const changes = [];
  if (values.status !== ticket.status) {
    changes.push(`Status changed to ${TICKET_STATUS_LABELS[values.status]}.`);
  }
  if (values.assigneeId !== ticket.assigneeId) {
    changes.push(`Assigned to ${TEAM_MEMBER_NAMES.get(values.assigneeId) ?? 'no one'}.`);
  }
  const note = [...changes, values.note.trim()].filter(Boolean).join(' ');
  return {
    ...ticket,
    status: values.status,
    assigneeId: values.assigneeId,
    updates: [...ticket.updates, createUpdate(todayIso, by, note, values.status)],
  };
}
