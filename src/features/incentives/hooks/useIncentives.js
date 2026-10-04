import { useReducer } from 'react';

import { getIncentiveData } from '../api/incentiveData';

const ACTIONS = {
  SET_RULE: 'set-rule',
  ADD_PAYOUT: 'add-payout',
};

function incentivesReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_RULE:
      return { ...state, rules: { ...state.rules, [action.salespersonId]: action.rule } };
    case ACTIONS.ADD_PAYOUT:
      return { ...state, payouts: [...state.payouts, action.payout] };
    default:
      throw new Error(`Unknown incentives action: ${action.type}`);
  }
}

// In-memory incentive data until the incentives API exists; changes reset on reload.
export function useIncentives(initialData) {
  const [data, dispatch] = useReducer(
    incentivesReducer,
    initialData,
    (seed) => seed ?? getIncentiveData(),
  );

  return {
    data,
    setRule: (salespersonId, rule) => dispatch({ type: ACTIONS.SET_RULE, salespersonId, rule }),
    addPayout: (payout) => dispatch({ type: ACTIONS.ADD_PAYOUT, payout }),
  };
}
