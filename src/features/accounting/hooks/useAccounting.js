import { useReducer } from 'react';

import { INITIAL_BANKS, INITIAL_VOUCHERS } from '../constants';

const ACTIONS = {
  ADD_VOUCHER: 'add-voucher',
  REPLACE_VOUCHER: 'replace-voucher',
  ADD_BANK: 'add-bank',
  SET_BANK_ACTIVE: 'set-bank-active',
};

function accountingReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_VOUCHER:
      return { ...state, vouchers: [...state.vouchers, action.voucher] };
    case ACTIONS.REPLACE_VOUCHER:
      return {
        ...state,
        vouchers: state.vouchers.map((voucher) =>
          voucher.id === action.voucher.id ? action.voucher : voucher,
        ),
      };
    case ACTIONS.ADD_BANK:
      return { ...state, banks: [...state.banks, action.bank] };
    case ACTIONS.SET_BANK_ACTIVE:
      return {
        ...state,
        banks: state.banks.map((bank) =>
          bank.code === action.code ? { ...bank, isActive: action.isActive } : bank,
        ),
      };
    default:
      throw new Error(`Unknown accounting action: ${action.type}`);
  }
}

/**
 * Vouchers and bank accounts, held in memory until there's an accounting API. Every accounting
 * page reads from this one store, so a voucher posted on one page shows in all the others.
 */
export function useAccounting() {
  const [state, dispatch] = useReducer(accountingReducer, {
    vouchers: INITIAL_VOUCHERS,
    banks: INITIAL_BANKS,
  });

  return {
    ...state,
    addVoucher: (voucher) => dispatch({ type: ACTIONS.ADD_VOUCHER, voucher }),
    /** Saves a cancelled copy of a voucher. */
    replaceVoucher: (voucher) => dispatch({ type: ACTIONS.REPLACE_VOUCHER, voucher }),
    addBank: (bank) => dispatch({ type: ACTIONS.ADD_BANK, bank }),
    setBankActive: (code, isActive) => dispatch({ type: ACTIONS.SET_BANK_ACTIVE, code, isActive }),
  };
}
