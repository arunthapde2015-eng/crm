import { INITIAL_TICKETS, PRIORITIES, TICKET_STATUSES } from '../constants';
import {
  applyUpdate,
  createTicket,
  filterTickets,
  getDueDate,
  getEmptyTicketValues,
  getStatusCounts,
  getSummary,
  getUpdateFormValues,
  validateTicket,
  validateUpdate,
} from './tickets';

const TODAY = '2026-10-04';
const ALL = { query: '', status: 'all', priority: 'all', category: 'all', assignee: 'all' };
const numbers = (filters) =>
  filterTickets(INITIAL_TICKETS, { ...ALL, ...filters }).map((t) => t.number);
const find = (number) => INITIAL_TICKETS.find((ticket) => ticket.number === number);

describe('ticket list', () => {
  it('puts active tickets first, soonest due and most urgent at the top', () => {
    expect(numbers({})).toEqual([
      'TKT-2026-0002',
      'TKT-2026-0001',
      'TKT-2026-0004',
      'TKT-2026-0003',
    ]);
  });

  it('filters by priority, category and assignee', () => {
    expect(numbers({ priority: PRIORITIES.HIGH })).toEqual(['TKT-2026-0002', 'TKT-2026-0001']);
    expect(numbers({ category: 'Billing' })).toEqual(['TKT-2026-0003']);
    expect(numbers({ assignee: 'priya' })).toEqual(['TKT-2026-0001', 'TKT-2026-0004']);
    expect(numbers({ assignee: 'unassigned' })).toEqual([]);
    expect(numbers({ query: 'konkan' })).toEqual(['TKT-2026-0001']);
  });

  it('counts open, past due and status totals', () => {
    expect(getSummary(INITIAL_TICKETS, TODAY, 'Anita Deshpande')).toEqual({
      open: 3,
      pastDue: 3,
      assignedToYou: 0,
    });
    expect(getStatusCounts(INITIAL_TICKETS)).toEqual({
      open: 1,
      'in-progress': 1,
      waiting: 1,
      resolved: 1,
      closed: 0,
    });
  });

  it('hides closed tickets unless asked for', () => {
    const closed = applyUpdate(
      find('TKT-2026-0003'),
      { status: TICKET_STATUSES.CLOSED, assigneeId: 'meera', note: '' },
      TODAY,
      'Meera Iyer',
    );
    const tickets = INITIAL_TICKETS.map((ticket) => (ticket.id === closed.id ? closed : ticket));
    expect(filterTickets(tickets, ALL).map((t) => t.number)).not.toContain('TKT-2026-0003');
    expect(
      filterTickets(tickets, { ...ALL, status: TICKET_STATUSES.CLOSED }).map((t) => t.number),
    ).toEqual(['TKT-2026-0003']);
  });
});

describe('raising and updating', () => {
  it('sets the due date from the priority', () => {
    expect(getDueDate('2026-09-28', PRIORITIES.HIGH)).toBe('2026-09-29');
    expect(getDueDate('2026-09-26', PRIORITIES.MEDIUM)).toBe('2026-09-29');
    expect(getDueDate('2026-09-22', PRIORITIES.LOW)).toBe('2026-09-29');
  });

  it('checks a new ticket and numbers it', () => {
    expect(validateTicket({ ...getEmptyTicketValues(), phone: '123' })).toEqual([
      'Enter the merchant or customer.',
      'Enter a 10-digit phone number.',
      'Enter a subject.',
      'Describe the problem.',
    ]);
    const ticket = createTicket(
      {
        ...getEmptyTicketValues(),
        customer: 'Royal Caterers',
        subject: 'Settlement not received',
        description: 'Yesterday’s card settlement is missing.',
      },
      INITIAL_TICKETS,
      TODAY,
      'Anita Deshpande',
    );
    expect(ticket).toMatchObject({
      number: 'TKT-2026-0005',
      due: '2026-10-07',
      status: TICKET_STATUSES.OPEN,
    });
  });

  it('needs a change, and a note to resolve', () => {
    const ticket = find('TKT-2026-0001');
    const values = getUpdateFormValues(ticket);
    expect(validateUpdate(values, ticket)).toEqual([
      'Change the status or assignee, or add a note.',
    ]);
    expect(validateUpdate({ ...values, status: TICKET_STATUSES.RESOLVED }, ticket)).toEqual([
      'Add a note on how it was resolved.',
    ]);
  });

  it('records what changed in the history', () => {
    const updated = applyUpdate(
      find('TKT-2026-0001'),
      { status: TICKET_STATUSES.IN_PROGRESS, assigneeId: 'rohan', note: 'Visiting on Monday.' },
      TODAY,
      'Anita Deshpande',
    );
    expect(updated.updates.at(-1)).toMatchObject({
      date: TODAY,
      by: 'Anita Deshpande',
      note: 'Status changed to In Progress. Assigned to Rohan Kulkarni. Visiting on Monday.',
    });
  });
});
