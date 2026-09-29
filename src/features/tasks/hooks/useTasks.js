import { useReducer } from 'react';

import { INITIAL_TASKS } from '../constants';

function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added':
      return [...tasks, action.task];
    case 'toggled':
      return tasks.map((task) =>
        task.id === action.id ? { ...task, isDone: !task.isDone } : task,
      );
    case 'removed':
      return tasks.filter((task) => task.id !== action.id);
    default:
      throw new Error(`Unknown task action: ${action.type}`);
  }
}

export function useTasks(initialTasks = INITIAL_TASKS) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  const remainingCount = tasks.filter((task) => !task.isDone).length;

  return {
    tasks,
    remainingCount,
    addTask: (task) => dispatch({ type: 'added', task }),
    toggleTask: (id) => dispatch({ type: 'toggled', id }),
    removeTask: (id) => dispatch({ type: 'removed', id }),
  };
}
