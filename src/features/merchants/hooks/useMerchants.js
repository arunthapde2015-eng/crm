import { useReducer } from 'react';

import { INITIAL_MERCHANTS } from '../constants';
import { setMerchantStatus, updateMerchant } from '../utils/merchantChanges';

const ACTIONS = {
  ADD: 'add',
  UPDATE: 'update',
  SET_STATUS: 'set-status',
};

function merchantsReducer(merchants, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      return [...merchants, action.merchant];
    case ACTIONS.UPDATE:
      return merchants.map((merchant) =>
        merchant.id === action.merchantId ? updateMerchant(merchant, action.values) : merchant,
      );
    case ACTIONS.SET_STATUS:
      return setMerchantStatus(merchants, action.merchantIds, action.status);
    default:
      throw new Error(`Unknown merchants action: ${action.type}`);
  }
}

// In-memory merchant list until the merchants API exists; changes reset on reload.
export function useMerchants(initialMerchants = INITIAL_MERCHANTS) {
  const [merchants, dispatch] = useReducer(merchantsReducer, initialMerchants);

  return {
    merchants,
    addMerchant: (merchant) => dispatch({ type: ACTIONS.ADD, merchant }),
    updateMerchant: (merchantId, values) => dispatch({ type: ACTIONS.UPDATE, merchantId, values }),
    setStatus: (merchantIds, status) => dispatch({ type: ACTIONS.SET_STATUS, merchantIds, status }),
  };
}
