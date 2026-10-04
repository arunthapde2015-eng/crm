import { useReducer } from 'react';

import { INITIAL_EXPENSES } from '../constants';

const ACTIONS = {
  ADD: 'add',
  REPLACE: 'replace',
};

function expensesReducer(expenses, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      return [...expenses, action.expense];
    case ACTIONS.REPLACE:
      return expenses.map((expense) =>
        expense.id === action.expense.id ? action.expense : expense,
      );
    default:
      throw new Error(`Unknown expense action: ${action.type}`);
  }
}

/** Expenses held in memory until there's an accounting API. Nothing is ever deleted. */
export function useExpenses() {
  const [expenses, dispatch] = useReducer(expensesReducer, INITIAL_EXPENSES);

  return {
    expenses,
    addExpense: (expense) => dispatch({ type: ACTIONS.ADD, expense }),
    /** Saves an approved or rejected copy of an expense. */
    replaceExpense: (expense) => dispatch({ type: ACTIONS.REPLACE, expense }),
  };
}
