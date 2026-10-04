import { useReducer } from 'react';

import { INITIAL_MERCHANTS } from '../constants';
import { setMerchantStatus, updateMerchant } from '../utils/merchantChanges';
import { addOutlet, addRemark } from '../utils/merchantDetails';

const ACTIONS = {
  ADD: 'add',
  UPDATE: 'update',
  SET_STATUS: 'set-status',
  DELETE: 'delete',
  ADD_OUTLET: 'add-outlet',
  ADD_REMARK: 'add-remark',
};

function updateOne(merchants, merchantId, update) {
  return merchants.map((merchant) => (merchant.id === merchantId ? update(merchant) : merchant));
}

function merchantsReducer(merchants, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      return [...merchants, action.merchant];
    case ACTIONS.UPDATE:
      return updateOne(merchants, action.merchantId, (merchant) =>
        updateMerchant(merchant, action.values),
      );
    case ACTIONS.SET_STATUS:
      return setMerchantStatus(merchants, action.merchantIds, action.status);
    case ACTIONS.DELETE:
      return merchants.filter((merchant) => merchant.id !== action.merchantId);
    case ACTIONS.ADD_OUTLET:
      return updateOne(merchants, action.merchantId, (merchant) =>
        addOutlet(merchant, action.outletName),
      );
    case ACTIONS.ADD_REMARK:
      return updateOne(merchants, action.merchantId, (merchant) =>
        addRemark(merchant, action.text, action.author),
      );
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
    deleteMerchant: (merchantId) => dispatch({ type: ACTIONS.DELETE, merchantId }),
    addOutlet: (merchantId, outletName) =>
      dispatch({ type: ACTIONS.ADD_OUTLET, merchantId, outletName }),
    addRemark: (merchantId, text, author) =>
      dispatch({ type: ACTIONS.ADD_REMARK, merchantId, text, author }),
  };
}
