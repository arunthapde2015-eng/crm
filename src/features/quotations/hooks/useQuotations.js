import { useReducer } from 'react';

import { APPROVAL_STATUSES, INITIAL_QUOTATIONS, QUOTATION_STATUSES } from '../constants';
import { reviseQuotation } from '../utils/quotations';

const ACTIONS = {
  ADD: 'add',
  REVISE: 'revise',
  SET_STATUS: 'set-status',
  SET_APPROVAL: 'set-approval',
};

function updateById(quotations, id, update) {
  return quotations.map((quotation) => (quotation.id === id ? update(quotation) : quotation));
}

function quotationsReducer(quotations, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      return [...quotations, action.quotation];
    case ACTIONS.REVISE:
      return updateById(quotations, action.id, (quotation) =>
        reviseQuotation(quotation, action.values),
      );
    case ACTIONS.SET_STATUS:
      return updateById(quotations, action.id, (quotation) => ({
        ...quotation,
        status: action.status,
      }));
    case ACTIONS.SET_APPROVAL:
      return updateById(quotations, action.id, (quotation) => ({
        ...quotation,
        approval: action.approval,
      }));
    default:
      throw new Error(`Unknown quotations action: ${action.type}`);
  }
}

// In-memory quotations until the quotations API exists; changes reset on reload.
export function useQuotations(initialQuotations = INITIAL_QUOTATIONS) {
  const [quotations, dispatch] = useReducer(quotationsReducer, initialQuotations);
  const setStatus = (id, status) => dispatch({ type: ACTIONS.SET_STATUS, id, status });
  const setApproval = (id, approval) => dispatch({ type: ACTIONS.SET_APPROVAL, id, approval });

  return {
    quotations,
    addQuotation: (quotation) => dispatch({ type: ACTIONS.ADD, quotation }),
    reviseQuotation: (id, values) => dispatch({ type: ACTIONS.REVISE, id, values }),
    send: (id) => setStatus(id, QUOTATION_STATUSES.SENT),
    markAccepted: (id) => setStatus(id, QUOTATION_STATUSES.ACCEPTED),
    markRejected: (id) => setStatus(id, QUOTATION_STATUSES.REJECTED),
    convert: (id) => setStatus(id, QUOTATION_STATUSES.CONVERTED),
    approveDiscount: (id) => setApproval(id, APPROVAL_STATUSES.APPROVED),
    rejectDiscount: (id) => setApproval(id, APPROVAL_STATUSES.REJECTED),
  };
}
