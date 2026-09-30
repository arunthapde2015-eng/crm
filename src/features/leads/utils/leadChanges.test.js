import { SALESPERSONS } from '@/constants/team';

import { INITIAL_LEADS, LEAD_STATUSES } from '../constants';
import { assignLeads, assignUnassignedLeads, createLead } from './leadChanges';
import { getUnassignedLeads } from './leadQueries';

const TEAM = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
];

function openLead(id, salespersonId) {
  return { id, number: `LD-2026-000${id}`, salespersonId, status: LEAD_STATUSES.NEW, value: 0 };
}

describe('assignLeads', () => {
  it('moves only the listed leads', () => {
    const leads = [openLead('1', 'a'), openLead('2', 'a')];

    expect(assignLeads(leads, ['2'], 'b').map((lead) => lead.salespersonId)).toEqual(['a', 'b']);
  });
});

describe('assignUnassignedLeads', () => {
  it('gives each unassigned lead to the least busy salesperson', () => {
    const leads = [
      openLead('1', 'a'),
      openLead('2', null),
      openLead('3', null),
      openLead('4', null),
    ];

    const assigned = assignUnassignedLeads(leads, TEAM);

    expect(assigned.map((lead) => lead.salespersonId)).toEqual(['a', 'b', 'a', 'b']);
  });

  it('leaves no seed lead unassigned', () => {
    expect(getUnassignedLeads(assignUnassignedLeads(INITIAL_LEADS, SALESPERSONS))).toEqual([]);
  });
});

describe('createLead', () => {
  const values = {
    name: '  Acme Traders ',
    contactName: 'Ravi',
    mobile: '9876543210',
    source: 'Google',
    product: 'POS',
    value: '25000',
    priority: 'high',
    salespersonId: '',
  };

  it('numbers the lead after the highest existing one for the year', () => {
    const lead = createLead(values, INITIAL_LEADS, new Date(2026, 8, 30));

    expect(lead).toMatchObject({
      number: 'LD-2026-0019',
      name: 'Acme Traders',
      value: 25000,
      salespersonId: null,
      status: LEAD_STATUSES.NEW,
    });
  });

  it('starts numbering at 1 in a new year', () => {
    expect(createLead(values, INITIAL_LEADS, new Date(2027, 0, 1)).number).toBe('LD-2027-0001');
  });
});
