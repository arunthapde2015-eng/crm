import { useReducer } from 'react';

import { INITIAL_ACTIVITY, INITIAL_ROLES, INITIAL_USERS } from '../constants';

const ACTIONS = {
  SAVE_USER: 'save-user',
  SAVE_ROLE: 'save-role',
  DELETE_ROLE: 'delete-role',
};

/** Replaces the item with the same id, or adds it at the end. */
function upsert(items, item) {
  return items.some((existing) => existing.id === item.id)
    ? items.map((existing) => (existing.id === item.id ? item : existing))
    : [...items, item];
}

function userAdminReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SAVE_USER:
      return {
        ...state,
        users: upsert(state.users, action.user),
        activity: action.activity ? [action.activity, ...state.activity] : state.activity,
      };
    case ACTIONS.SAVE_ROLE:
      return { ...state, roles: upsert(state.roles, action.role) };
    case ACTIONS.DELETE_ROLE:
      return { ...state, roles: state.roles.filter((role) => role.id !== action.roleId) };
    default:
      throw new Error(`Unknown user admin action: ${action.type}`);
  }
}

/** Users, roles and sign-in activity held in memory until there's an identity service. */
export function useUserAdmin() {
  const [state, dispatch] = useReducer(userAdminReducer, {
    users: INITIAL_USERS,
    roles: INITIAL_ROLES,
    activity: INITIAL_ACTIVITY,
  });

  return {
    ...state,
    /** Adds or updates a user, optionally logging an activity entry (added, password reset). */
    saveUser: (user, activity = null) => dispatch({ type: ACTIONS.SAVE_USER, user, activity }),
    saveRole: (role) => dispatch({ type: ACTIONS.SAVE_ROLE, role }),
    deleteRole: (roleId) => dispatch({ type: ACTIONS.DELETE_ROLE, roleId }),
  };
}
