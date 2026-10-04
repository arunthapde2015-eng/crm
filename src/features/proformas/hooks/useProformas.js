import { useReducer } from 'react';

import { INITIAL_PROFORMAS, PROFORMA_STATUSES } from '../constants';
import { reviseProforma } from '../utils/proformas';

const ACTIONS = {
  ADD: 'add',
  REVISE: 'revise',
  SET_STATUS: 'set-status',
};

function proformasReducer(proformas, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      return [...proformas, action.proforma];
    case ACTIONS.REVISE:
      return proformas.map((proforma) =>
        proforma.id === action.id ? reviseProforma(proforma, action.values) : proforma,
      );
    case ACTIONS.SET_STATUS:
      return proformas.map((proforma) =>
        proforma.id === action.id ? { ...proforma, status: action.status } : proforma,
      );
    default:
      throw new Error(`Unknown proformas action: ${action.type}`);
  }
}

// In-memory proformas until the billing API exists; changes reset on reload.
// Financial records are never deleted: a proforma is cancelled instead.
export function useProformas(initialProformas = INITIAL_PROFORMAS) {
  const [proformas, dispatch] = useReducer(proformasReducer, initialProformas);
  const setStatus = (id, status) => dispatch({ type: ACTIONS.SET_STATUS, id, status });

  return {
    proformas,
    addProforma: (proforma) => dispatch({ type: ACTIONS.ADD, proforma }),
    reviseProforma: (id, values) => dispatch({ type: ACTIONS.REVISE, id, values }),
    convert: (id) => setStatus(id, PROFORMA_STATUSES.CONVERTED),
    cancel: (id) => setStatus(id, PROFORMA_STATUSES.CANCELLED),
  };
}
