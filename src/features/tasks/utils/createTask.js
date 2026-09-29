import { MAX_TASK_TITLE_LENGTH } from '../constants';

/**
 * Builds a new task from raw user input, or returns null if the input is blank.
 * @param {string} rawTitle
 * @returns {{ id: string, title: string, isDone: boolean } | null}
 */
export function createTask(rawTitle) {
  const title = rawTitle.trim().slice(0, MAX_TASK_TITLE_LENGTH);
  if (title === '') return null;

  return { id: crypto.randomUUID(), title, isDone: false };
}
