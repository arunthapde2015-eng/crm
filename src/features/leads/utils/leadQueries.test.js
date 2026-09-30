import { SALESPERSONS } from '@/constants/team';

import {
  DEFAULT_LEAD_FILTERS,
  FOLLOW_UP_STATES,
  INITIAL_LEADS,
  LEAD_STATUSES,
  UNASSIGNED_FILTER_VALUE,
} from '../constants';
import {
  filterLeads,
  getFollowUpState,
  getPipelineValue,
  getTeamWorkload,
  getUnassignedLeads,
} from './leadQueries';

describe('filterLeads', () => {
  it('returns everything with the default filters', () => {
    expect(filterLeads(INITIAL_LEADS, DEFAULT_LEAD_FILTERS)).toHaveLength(INITIAL_LEADS.length);
  });

  it('matches name, lead number and spaced mobile numbers, ignoring case', () => {
    const search = (query) =>
      filterLeads(INITIAL_LEADS, { ...DEFAULT_LEAD_FILTERS, query }).map((lead) => lead.name);

    expect(search('konkan')).toEqual(['Konkan Fresh Mart']);
    expect(search('LD-2026-0002')).toEqual(['Sahyadri Multispeciality Clinic']);
    expect(search('98230 10003')).toEqual(['Nirmal Co-operative Credit Society']);
  });

  it('combines status, source and salesperson filters', () => {
    const filtered = filterLeads(INITIAL_LEADS, {
      ...DEFAULT_LEAD_FILTERS,
      status: LEAD_STATUSES.WON,
      source: 'Referral',
      salesperson: 'rohan',
    });

    expect(filtered.map((lead) => lead.name)).toEqual(['Vidya Vikas School Trust']);
  });

  it('can show only unassigned leads', () => {
    const filtered = filterLeads(INITIAL_LEADS, {
      ...DEFAULT_LEAD_FILTERS,
      salesperson: UNASSIGNED_FILTER_VALUE,
    });

    expect(filtered).toEqual(getUnassignedLeads(INITIAL_LEADS));
  });
});

describe('seed data summary', () => {
  it('matches the headline figures', () => {
    expect(getPipelineValue(INITIAL_LEADS)).toBe(941600);
    expect(getUnassignedLeads(INITIAL_LEADS)).toHaveLength(2);
    expect(getTeamWorkload(INITIAL_LEADS, SALESPERSONS).map((m) => m.openLeadCount)).toEqual([
      0, 5, 5,
    ]);
  });
});

describe('getFollowUpState', () => {
  it('compares against today', () => {
    expect(getFollowUpState('2026-09-28', '2026-09-30')).toBe(FOLLOW_UP_STATES.OVERDUE);
    expect(getFollowUpState('2026-09-30', '2026-09-30')).toBe(FOLLOW_UP_STATES.TODAY);
    expect(getFollowUpState('2026-10-02', '2026-09-30')).toBe(FOLLOW_UP_STATES.UPCOMING);
  });
});
