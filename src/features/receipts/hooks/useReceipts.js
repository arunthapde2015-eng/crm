import { useReducer } from 'react';

import { INITIAL_RECEIPTS } from '../constants';
import { voidReceipt } from '../utils/receipts';

const ACTIONS = {
  ADD: 'add',
  VOID: 'void',
};

function receiptsReducer(receipts, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      return [...receipts, action.receipt];
    case ACTIONS.VOID:
      return receipts.map((receipt) =>
        receipt.id === action.id
          ? voidReceipt(receipt, action.status, action.reason, action.date)
          : receipt,
      );
    default:
      throw new Error(`Unknown receipts action: ${action.type}`);
  }
}

// In-memory receipts until the billing API exists; changes reset on reload.
// Receipts are never deleted: a wrong or failed one is marked cancelled or bounced.
export function useReceipts(initialReceipts = INITIAL_RECEIPTS) {
  const [receipts, dispatch] = useReducer(receiptsReducer, initialReceipts);

  return {
    receipts,
    addReceipt: (receipt) => dispatch({ type: ACTIONS.ADD, receipt }),
    voidReceipt: (id, status, reason, date) =>
      dispatch({ type: ACTIONS.VOID, id, status, reason, date }),
  };
}
