import { useReducer } from 'react';

import { INITIAL_CONTRACTS } from '../constants';

const ACTIONS = {
  ADD_PERIOD: 'add-period',
  MARK_PAID: 'mark-paid',
  UPDATE: 'update',
};

function updateContract(contracts, contractId, update) {
  return contracts.map((contract) => (contract.id === contractId ? update(contract) : contract));
}

function contractsReducer(contracts, action) {
  switch (action.type) {
    case ACTIONS.ADD_PERIOD:
      return updateContract(contracts, action.contractId, (contract) => ({
        ...contract,
        periods: [...contract.periods, action.period],
      }));
    case ACTIONS.MARK_PAID:
      return updateContract(contracts, action.contractId, (contract) => ({
        ...contract,
        periods: contract.periods.map((period) =>
          period.invoiceNumber === action.payment.invoiceNumber
            ? { ...period, isPaid: true }
            : period,
        ),
        payments: [...contract.payments, action.payment],
      }));
    case ACTIONS.UPDATE:
      return updateContract(contracts, action.contractId, (contract) => ({
        ...contract,
        ...action.changes,
        activity: [...contract.activity, action.activity],
      }));
    default:
      throw new Error(`Unknown AMC action: ${action.type}`);
  }
}

/** AMC contracts held in memory until there's a billing API. */
export function useAmcContracts() {
  const [contracts, dispatch] = useReducer(contractsReducer, INITIAL_CONTRACTS);

  return {
    contracts,
    addPeriod: (contractId, period) => dispatch({ type: ACTIONS.ADD_PERIOD, contractId, period }),
    /** Settles an AMC invoice and records the payment against it. */
    markPaid: (contractId, payment) => dispatch({ type: ACTIONS.MARK_PAID, contractId, payment }),
    /** Applies profile or status changes (may be empty) and logs them on the timeline. */
    updateContract: (contractId, changes, activity) =>
      dispatch({ type: ACTIONS.UPDATE, contractId, changes, activity }),
  };
}
