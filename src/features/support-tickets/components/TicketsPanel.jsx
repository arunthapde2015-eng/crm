import { useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { SelectField } from '@/components/SelectField';
import { StatGrid } from '@/components/StatGrid';
import { CURRENT_USER } from '@/constants/session';
import { toIsoDate } from '@/utils/formatDate';

import {
  ALL_FILTER_VALUE,
  PRIORITY_LABELS,
  TICKET_CATEGORIES,
  TICKET_STATUS_LABELS,
  UNASSIGNED_VALUE,
} from '../constants';
import { useTickets } from '../hooks/useTickets';
import {
  applyUpdate,
  createTicket,
  filterTickets,
  getEmptyTicketValues,
  getStatusCounts,
  getSummary,
} from '../utils/tickets';
import { TicketDrawer } from './TicketDrawer';
import { TicketForm } from './TicketForm';
import { TicketsTable } from './TicketsTable';
import { ASSIGNEE_OPTIONS } from './ticketOptions';
import styles from './Tickets.module.css';

const toOptions = (entries) => entries.map(([value, label]) => ({ value, label }));
const FILTERS = [
  {
    name: 'status',
    label: 'Status',
    options: [
      { value: ALL_FILTER_VALUE, label: 'All statuses' },
      ...toOptions(Object.entries(TICKET_STATUS_LABELS)),
    ],
  },
  {
    name: 'priority',
    label: 'Priority',
    options: [
      { value: ALL_FILTER_VALUE, label: 'All priorities' },
      ...toOptions(Object.entries(PRIORITY_LABELS)),
    ],
  },
  {
    name: 'category',
    label: 'Category',
    options: [
      { value: ALL_FILTER_VALUE, label: 'All categories' },
      ...TICKET_CATEGORIES.map((category) => ({ value: category, label: category })),
    ],
  },
  {
    name: 'assignee',
    label: 'Assigned to',
    options: [
      { value: ALL_FILTER_VALUE, label: 'Anyone' },
      { value: UNASSIGNED_VALUE, label: 'Unassigned' },
      ...ASSIGNEE_OPTIONS.filter((option) => option.value !== ''),
    ],
  },
];
const INITIAL_FILTERS = {
  query: '',
  status: ALL_FILTER_VALUE,
  priority: ALL_FILTER_VALUE,
  category: ALL_FILTER_VALUE,
  assignee: ALL_FILTER_VALUE,
};

function formatSummary({ open, pastDue, assignedToYou }) {
  return `${open} open, ${pastDue} past due, ${assignedToYou} assigned to you. Closed tickets are hidden unless you filter by status.`;
}

/**
 * Customer problems from raising to resolution.
 *
 * @param {object} props
 * @param {Date} [props.today] - Injectable for tests.
 */
export function TicketsPanel({ today = new Date() }) {
  const todayIso = toIsoDate(today);
  const { tickets, addTicket, replaceTicket } = useTickets();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openTicketId, setOpenTicketId] = useState(null);
  const openTicket = tickets.find((ticket) => ticket.id === openTicketId);
  const counts = getStatusCounts(tickets);

  function handleSubmit(values) {
    const ticket = createTicket(values, tickets, todayIso, CURRENT_USER.name);
    addTicket(ticket);
    setIsFormOpen(false);
    setOpenTicketId(ticket.id);
  }

  return (
    <>
      <PageHeader
        title="Support tickets"
        description={formatSummary(getSummary(tickets, todayIso, CURRENT_USER.name))}
        actions={
          <Button onClick={() => setIsFormOpen(true)} disabled={isFormOpen}>
            Raise ticket
          </Button>
        }
      />
      <div className={styles.body}>
        <StatGrid
          label="Tickets by status"
          stats={Object.entries(TICKET_STATUS_LABELS).map(([status, label]) => ({
            id: status,
            label,
            value: counts[status],
          }))}
        />
        {isFormOpen && (
          <TicketForm
            initialValues={getEmptyTicketValues()}
            todayIso={todayIso}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        )}
        <div className={styles.filters}>
          <label htmlFor="ticket-filter-query" className="visually-hidden">
            Filter tickets
          </label>
          <input
            id="ticket-filter-query"
            type="search"
            className={styles.searchInput}
            placeholder="Filter this list"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
          />
          {FILTERS.map((filter) => (
            <SelectField
              key={filter.name}
              id={`ticket-filter-${filter.name}`}
              label={filter.label}
              isLabelHidden
              options={filter.options}
              value={filters[filter.name]}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, [filter.name]: event.target.value }))
              }
            />
          ))}
        </div>
        <TicketsTable
          tickets={filterTickets(tickets, filters)}
          todayIso={todayIso}
          onOpen={(ticket) => setOpenTicketId(ticket.id)}
        />
      </div>
      {openTicket && (
        <TicketDrawer
          ticket={openTicket}
          todayIso={todayIso}
          onUpdate={(values) =>
            replaceTicket(applyUpdate(openTicket, values, todayIso, CURRENT_USER.name))
          }
          onClose={() => setOpenTicketId(null)}
        />
      )}
    </>
  );
}
