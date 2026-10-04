import { useReducer } from 'react';

import { INITIAL_TICKETS } from '../constants';

const ACTIONS = {
  ADD: 'add',
  REPLACE: 'replace',
};

function ticketsReducer(tickets, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      return [...tickets, action.ticket];
    case ACTIONS.REPLACE:
      return tickets.map((ticket) => (ticket.id === action.ticket.id ? action.ticket : ticket));
    default:
      throw new Error(`Unknown ticket action: ${action.type}`);
  }
}

/** Support tickets held in memory until there's a helpdesk API. Tickets are never deleted. */
export function useTickets() {
  const [tickets, dispatch] = useReducer(ticketsReducer, INITIAL_TICKETS);

  return {
    tickets,
    addTicket: (ticket) => dispatch({ type: ACTIONS.ADD, ticket }),
    /** Saves an updated copy of a ticket. */
    replaceTicket: (ticket) => dispatch({ type: ACTIONS.REPLACE, ticket }),
  };
}
