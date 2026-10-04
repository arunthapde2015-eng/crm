import { useReducer } from 'react';

import { INITIAL_TASKS } from '../constants';
import { updateTask } from '../utils/tasks';

const ACTIONS = {
  ADD: 'add',
  UPDATE: 'update',
  SET_STATUS: 'set-status',
};

function tasksReducer(tasks, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      return [...tasks, action.task];
    case ACTIONS.UPDATE:
      return tasks.map((task) =>
        task.id === action.taskId ? updateTask(task, action.values) : task,
      );
    case ACTIONS.SET_STATUS:
      return tasks.map((task) =>
        task.id === action.taskId ? { ...task, status: action.status } : task,
      );
    default:
      throw new Error(`Unknown task action: ${action.type}`);
  }
}

// In-memory tasks until the tasks API exists; changes reset on reload.
export function useTasks(initialTasks = INITIAL_TASKS) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  return {
    tasks,
    addTask: (task) => dispatch({ type: ACTIONS.ADD, task }),
    updateTask: (taskId, values) => dispatch({ type: ACTIONS.UPDATE, taskId, values }),
    setTaskStatus: (taskId, status) => dispatch({ type: ACTIONS.SET_STATUS, taskId, status }),
  };
}
