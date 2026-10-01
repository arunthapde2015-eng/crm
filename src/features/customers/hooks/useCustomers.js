import { useReducer } from 'react';

import { INITIAL_CUSTOMERS } from '../constants';
import { setCustomerStatus, updateCustomer } from '../utils/customerChanges';

const ACTIONS = {
  ADD: 'add',
  UPDATE: 'update',
  SET_STATUS: 'set-status',
};

function customersReducer(customers, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      return [...customers, action.customer];
    case ACTIONS.UPDATE:
      return customers.map((customer) =>
        customer.id === action.customerId ? updateCustomer(customer, action.values) : customer,
      );
    case ACTIONS.SET_STATUS:
      return setCustomerStatus(customers, action.customerIds, action.status);
    default:
      throw new Error(`Unknown customers action: ${action.type}`);
  }
}

// In-memory customer list until the customers API exists; changes reset on reload.
export function useCustomers(initialCustomers = INITIAL_CUSTOMERS) {
  const [customers, dispatch] = useReducer(customersReducer, initialCustomers);

  return {
    customers,
    addCustomer: (customer) => dispatch({ type: ACTIONS.ADD, customer }),
    updateCustomer: (customerId, values) => dispatch({ type: ACTIONS.UPDATE, customerId, values }),
    setStatus: (customerIds, status) => dispatch({ type: ACTIONS.SET_STATUS, customerIds, status }),
  };
}
