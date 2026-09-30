import {
  ALL_FILTER_VALUE,
  FOLLOW_UP_STATES,
  OPEN_LEAD_STATUSES,
  UNASSIGNED_FILTER_VALUE,
} from '../constants';

export function isOpenLead(lead) {
  return OPEN_LEAD_STATUSES.includes(lead.status);
}

function matchesQuery(lead, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === '') return true;

  const searchableText = [lead.name, lead.number, lead.contactName, lead.product, lead.mobile]
    .join(' ')
    .toLowerCase();
  // Mobile numbers are displayed with a space, so ignore spaces when matching digits.
  return (
    searchableText.includes(normalizedQuery) ||
    lead.mobile.includes(normalizedQuery.replaceAll(' ', ''))
  );
}

function matchesSalesperson(lead, salesperson) {
  if (salesperson === ALL_FILTER_VALUE) return true;
  if (salesperson === UNASSIGNED_FILTER_VALUE) return lead.salespersonId === null;
  return lead.salespersonId === salesperson;
}

/**
 * @param {object[]} leads
 * @param {{ query: string, status: string, source: string, salesperson: string }} filters
 */
export function filterLeads(leads, { query, status, source, salesperson }) {
  return leads.filter(
    (lead) =>
      matchesQuery(lead, query) &&
      (status === ALL_FILTER_VALUE || lead.status === status) &&
      (source === ALL_FILTER_VALUE || lead.source === source) &&
      matchesSalesperson(lead, salesperson),
  );
}

export function getPipelineValue(leads) {
  return leads.reduce((total, lead) => total + lead.value, 0);
}

export function getUnassignedLeads(leads) {
  return leads.filter((lead) => lead.salespersonId === null);
}

/** Open-lead count per salesperson, in the given salesperson order. */
export function getTeamWorkload(leads, salespersons) {
  return salespersons.map((salesperson) => ({
    ...salesperson,
    openLeadCount: leads.filter((lead) => lead.salespersonId === salesperson.id && isOpenLead(lead))
      .length,
  }));
}

/** Both dates are ISO "YYYY-MM-DD" strings, which sort correctly as text. */
export function getFollowUpState(followUpIsoDate, todayIsoDate) {
  if (followUpIsoDate < todayIsoDate) return FOLLOW_UP_STATES.OVERDUE;
  if (followUpIsoDate === todayIsoDate) return FOLLOW_UP_STATES.TODAY;
  return FOLLOW_UP_STATES.UPCOMING;
}
