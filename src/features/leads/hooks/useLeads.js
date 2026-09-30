import { useReducer } from 'react';

import { SALESPERSONS } from '@/constants/team';

import { INITIAL_LEADS } from '../constants';
import { assignLeads, assignUnassignedLeads } from '../utils/leadChanges';

const ACTIONS = {
  ADD: 'add',
  ASSIGN: 'assign',
  ASSIGN_UNASSIGNED: 'assign-unassigned',
};

function leadsReducer(leads, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      return [...leads, action.lead];
    case ACTIONS.ASSIGN:
      return assignLeads(leads, action.leadIds, action.salespersonId);
    case ACTIONS.ASSIGN_UNASSIGNED:
      return assignUnassignedLeads(leads, SALESPERSONS);
    default:
      throw new Error(`Unknown leads action: ${action.type}`);
  }
}

// In-memory lead list until the leads API exists; changes reset on reload.
export function useLeads(initialLeads = INITIAL_LEADS) {
  const [leads, dispatch] = useReducer(leadsReducer, initialLeads);

  return {
    leads,
    addLead: (lead) => dispatch({ type: ACTIONS.ADD, lead }),
    assignLeads: (leadIds, salespersonId) =>
      dispatch({ type: ACTIONS.ASSIGN, leadIds, salespersonId }),
    assignAllUnassigned: () => dispatch({ type: ACTIONS.ASSIGN_UNASSIGNED }),
  };
}
