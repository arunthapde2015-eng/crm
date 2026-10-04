import { useReducer } from 'react';

import { INITIAL_INVOICES, INVOICE_STATUSES } from '../constants';
import { updateDraft } from '../utils/invoices';

const ACTIONS = {
  ADD: 'add',
  UPDATE_DRAFT: 'update-draft',
  SET_STATUS: 'set-status',
  ADD_PAYMENT: 'add-payment',
  ADD_NOTE: 'add-note',
};

function updateById(invoices, id, update) {
  return invoices.map((invoice) => (invoice.id === id ? update(invoice) : invoice));
}

function invoicesReducer(invoices, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      return [...invoices, action.invoice];
    case ACTIONS.UPDATE_DRAFT:
      return updateById(invoices, action.id, (invoice) =>
        updateDraft(invoice, action.values, invoices),
      );
    case ACTIONS.SET_STATUS:
      return updateById(invoices, action.id, (invoice) => ({ ...invoice, status: action.status }));
    case ACTIONS.ADD_PAYMENT:
      return updateById(invoices, action.id, (invoice) => ({
        ...invoice,
        payments: [...invoice.payments, action.payment],
      }));
    case ACTIONS.ADD_NOTE:
      return updateById(invoices, action.id, (invoice) => ({
        ...invoice,
        notes: [...invoice.notes, action.note],
      }));
    default:
      throw new Error(`Unknown invoices action: ${action.type}`);
  }
}

// In-memory invoices until the billing API exists; changes reset on reload.
// Invoices are never deleted: they're cancelled, or corrected with credit/debit notes.
export function useInvoices(initialInvoices = INITIAL_INVOICES) {
  const [invoices, dispatch] = useReducer(invoicesReducer, initialInvoices);
  const setStatus = (id, status) => dispatch({ type: ACTIONS.SET_STATUS, id, status });

  return {
    invoices,
    addInvoice: (invoice) => dispatch({ type: ACTIONS.ADD, invoice }),
    updateDraft: (id, values) => dispatch({ type: ACTIONS.UPDATE_DRAFT, id, values }),
    issue: (id) => setStatus(id, INVOICE_STATUSES.ISSUED),
    cancel: (id) => setStatus(id, INVOICE_STATUSES.CANCELLED),
    addPayment: (id, payment) => dispatch({ type: ACTIONS.ADD_PAYMENT, id, payment }),
    addNote: (id, note) => dispatch({ type: ACTIONS.ADD_NOTE, id, note }),
  };
}
