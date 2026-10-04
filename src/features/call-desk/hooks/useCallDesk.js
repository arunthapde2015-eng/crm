import { useReducer } from 'react';

import { INITIAL_CALL_LOG, INITIAL_QUEUE } from '../constants';

const ACTIONS = {
  LOG_CALL: 'log-call',
};

function callDeskReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOG_CALL:
      return { queue: action.queue, callLog: [action.logEntry, ...state.callLog] };
    default:
      throw new Error(`Unknown call desk action: ${action.type}`);
  }
}

/** Call queue and call log held in memory until there's a telephony or CRM API. */
export function useCallDesk() {
  const [state, dispatch] = useReducer(callDeskReducer, {
    queue: INITIAL_QUEUE,
    callLog: INITIAL_CALL_LOG,
  });

  return {
    ...state,
    /** Records a call and replaces the queue with what's left to call after it. */
    logCall: (logEntry, queue) => dispatch({ type: ACTIONS.LOG_CALL, logEntry, queue }),
  };
}
