import { createContext, useContext, useReducer } from 'react';

import { INITIAL_ROLES } from '@/constants/roles';
import { SESSION_STORAGE_KEY } from '@/constants/session';
import { INITIAL_ACTIVITY, INITIAL_USERS, SIGN_IN_EVENTS, USER_STATUSES } from '@/constants/users';
import {
  checkSignIn,
  describeDevice,
  recordFailedSignIn,
  recordSignIn,
  toTimestamp,
  WRONG_CREDENTIALS,
} from '@/utils/auth';

const AuthContext = createContext(null);

const ACTIONS = {
  SAVE_USER: 'save-user',
  START_SESSION: 'start-session',
  END_SESSION: 'end-session',
  SAVE_ROLE: 'save-role',
  DELETE_ROLE: 'delete-role',
};

/** Replaces the item with the same id, or adds it at the end. */
function upsert(items, item) {
  return items.some((existing) => existing.id === item.id)
    ? items.map((existing) => (existing.id === item.id ? item : existing))
    : [...items, item];
}

function authReducer(state, action) {
  const activity = [...(action.activities ?? []), ...state.activity];
  switch (action.type) {
    case ACTIONS.SAVE_USER:
      return { ...state, users: upsert(state.users, action.user), activity };
    case ACTIONS.START_SESSION:
      return {
        ...state,
        users: upsert(state.users, action.user),
        activity,
        sessionUserId: action.user.id,
      };
    case ACTIONS.END_SESSION:
      return { ...state, activity, sessionUserId: null };
    case ACTIONS.SAVE_ROLE:
      return { ...state, roles: upsert(state.roles, action.role) };
    case ACTIONS.DELETE_ROLE:
      return { ...state, roles: state.roles.filter((role) => role.id !== action.roleId) };
    default:
      throw new Error(`Unknown auth action: ${action.type}`);
  }
}

// Storage can be unavailable (private windows, blocked site data); signing in still works, it
// just won't survive a refresh.
function readStoredSession() {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredSession(userId) {
  try {
    if (userId) sessionStorage.setItem(SESSION_STORAGE_KEY, userId);
    else sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // See readStoredSession.
  }
}

function createActivity(now, userId, event, detail) {
  return { id: crypto.randomUUID(), at: toTimestamp(now), userId, event, detail };
}

/** Only an active, unlocked user can have a session. */
function getSessionUser(users, sessionUserId) {
  const user = users.find((item) => item.id === sessionUserId);
  return user && user.status === USER_STATUSES.ACTIVE && !user.isLocked ? user : null;
}

/**
 * Users, roles, sign-in activity and who is signed in. Held in memory until there's an identity
 * server, so changes last until the page is reloaded.
 *
 * @param {object} props
 * @param {string | null} [props.initialUserId] - Start signed in as this user (tests, demos).
 * @param {React.ReactNode} props.children
 */
export function AuthProvider({ initialUserId, children }) {
  const [state, dispatch] = useReducer(authReducer, undefined, () => ({
    users: INITIAL_USERS,
    roles: INITIAL_ROLES,
    activity: INITIAL_ACTIVITY,
    sessionUserId: initialUserId ?? readStoredSession(),
  }));
  const currentUser = getSessionUser(state.users, state.sessionUserId);
  const currentRole = state.roles.find((role) => role.id === currentUser?.roleId) ?? null;

  /** Returns '' on success or a message to show. Every attempt on a real account is logged. */
  function signIn(username, password, now = new Date()) {
    const { user, error } = checkSignIn(state.users, username, password);
    const device = describeDevice();
    if (!user) return error;

    if (error === WRONG_CREDENTIALS) {
      const failed = recordFailedSignIn(user);
      const activities = [createActivity(now, user.id, SIGN_IN_EVENTS.FAILED, device)];
      if (failed.isLocked && !user.isLocked) {
        activities.unshift(createActivity(now, user.id, SIGN_IN_EVENTS.LOCKED, device));
      }
      dispatch({ type: ACTIONS.SAVE_USER, user: failed, activities });
      return error;
    }
    if (error) return error;

    dispatch({
      type: ACTIONS.START_SESSION,
      user: recordSignIn(user, now),
      activities: [createActivity(now, user.id, SIGN_IN_EVENTS.SIGNED_IN, device)],
    });
    writeStoredSession(user.id);
    return '';
  }

  function signOut(now = new Date()) {
    const activities = currentUser
      ? [createActivity(now, currentUser.id, SIGN_IN_EVENTS.SIGNED_OUT, describeDevice())]
      : [];
    dispatch({ type: ACTIONS.END_SESSION, activities });
    writeStoredSession(null);
  }

  function changeOwnPassword(password, now = new Date()) {
    dispatch({
      type: ACTIONS.SAVE_USER,
      user: { ...currentUser, password, mustChangePassword: false },
      activities: [createActivity(now, currentUser.id, SIGN_IN_EVENTS.PASSWORD_CHANGED, '')],
    });
  }

  const value = {
    users: state.users,
    roles: state.roles,
    activity: state.activity,
    currentUser,
    currentRole,
    signIn,
    signOut,
    changeOwnPassword,
    /** Adds or updates a user, logging what happened (e.g. "User added by Anita Deshpande"). */
    saveUser: (user, event = null, detail = '', now = new Date()) =>
      dispatch({
        type: ACTIONS.SAVE_USER,
        user,
        activities: event ? [createActivity(now, user.id, event, detail)] : [],
      }),
    saveRole: (role) => dispatch({ type: ACTIONS.SAVE_ROLE, role }),
    deleteRole: (roleId) => dispatch({ type: ACTIONS.DELETE_ROLE, roleId }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** The signed-in user and their role, plus user and role management. */
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>.');
  return auth;
}
