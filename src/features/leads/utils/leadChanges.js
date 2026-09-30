import {
  LEAD_NUMBER_DIGITS,
  LEAD_NUMBER_PREFIX,
  LEAD_PRIORITIES,
  LEAD_STATUSES,
} from '../constants';
import { getTeamWorkload, isOpenLead } from './leadQueries';

/** Returns leads with the given ids moved to the salesperson (null to unassign). */
export function assignLeads(leads, leadIds, salespersonId) {
  return leads.map((lead) => (leadIds.includes(lead.id) ? { ...lead, salespersonId } : lead));
}

/**
 * Hands each unassigned lead to whoever has the fewest open leads at that moment,
 * so the team's workload evens out. Ties go to the salesperson listed first.
 */
export function assignUnassignedLeads(leads, salespersons) {
  if (salespersons.length === 0) return leads;

  const openCounts = new Map(
    getTeamWorkload(leads, salespersons).map((member) => [member.id, member.openLeadCount]),
  );

  return leads.map((lead) => {
    if (lead.salespersonId !== null) return lead;

    const [leastBusyId] = [...openCounts.entries()].reduce((least, entry) =>
      entry[1] < least[1] ? entry : least,
    );
    if (isOpenLead(lead)) openCounts.set(leastBusyId, openCounts.get(leastBusyId) + 1);
    return { ...lead, salespersonId: leastBusyId };
  });
}

function getNextLeadNumber(leads, year) {
  const yearPrefix = `${LEAD_NUMBER_PREFIX}-${year}-`;
  const highestSequence = leads
    .filter((lead) => lead.number.startsWith(yearPrefix))
    .reduce((highest, lead) => Math.max(highest, Number(lead.number.slice(yearPrefix.length))), 0);

  return `${yearPrefix}${String(highestSequence + 1).padStart(LEAD_NUMBER_DIGITS, '0')}`;
}

/**
 * Builds a new lead from form values, numbered after the existing leads for that year.
 *
 * @param {object} values - name, contactName, mobile, source, product, value, priority, salespersonId
 * @param {object[]} existingLeads
 * @param {Date} [createdAt]
 */
export function createLead(values, existingLeads, createdAt = new Date()) {
  return {
    id: crypto.randomUUID(),
    number: getNextLeadNumber(existingLeads, createdAt.getFullYear()),
    name: values.name.trim(),
    contactName: values.contactName.trim(),
    mobile: values.mobile.trim(),
    source: values.source,
    product: values.product.trim(),
    value: Number(values.value) || 0,
    nextFollowUp: null,
    salespersonId: values.salespersonId || null,
    priority: values.priority ?? LEAD_PRIORITIES.MEDIUM,
    status: LEAD_STATUSES.NEW,
  };
}
