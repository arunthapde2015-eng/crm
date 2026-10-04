import { useReducer } from 'react';

import { INITIAL_BILLS, INITIAL_VENDORS } from '../constants';

const ACTIONS = {
  ADD_BILL: 'add-bill',
  REPLACE_BILL: 'replace-bill',
  ADD_VENDOR: 'add-vendor',
};

function purchasesReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_BILL:
      return { ...state, bills: [...state.bills, action.bill] };
    case ACTIONS.REPLACE_BILL:
      return {
        ...state,
        bills: state.bills.map((bill) => (bill.id === action.bill.id ? action.bill : bill)),
      };
    case ACTIONS.ADD_VENDOR:
      return { ...state, vendors: [...state.vendors, action.vendor] };
    default:
      throw new Error(`Unknown purchase action: ${action.type}`);
  }
}

/** Vendors and purchase bills held in memory until there's an accounting API. */
export function usePurchases() {
  const [state, dispatch] = useReducer(purchasesReducer, {
    vendors: INITIAL_VENDORS,
    bills: INITIAL_BILLS,
  });

  return {
    ...state,
    addBill: (bill) => dispatch({ type: ACTIONS.ADD_BILL, bill }),
    /** Saves a paid copy of a bill. */
    replaceBill: (bill) => dispatch({ type: ACTIONS.REPLACE_BILL, bill }),
    addVendor: (vendor) => dispatch({ type: ACTIONS.ADD_VENDOR, vendor }),
  };
}
