import {
  ALL_FILTER_VALUE,
  LINK_TARGETS,
  MAX_TASK_TITLE_LENGTH,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../constants';

const LINK_TARGET_LABELS = new Map(LINK_TARGETS.map((target) => [target.id, target.label]));

export function isOpenTask(task) {
  return task.status !== TASK_STATUSES.DONE;
}

/** Open and past its due date. Dates are ISO strings, which compare correctly as text. */
export function isOverdueTask(task, todayIsoDate) {
  return isOpenTask(task) && task.dueDate < todayIsoDate;
}

/** Open tasks first, each group soonest due first. */
function compareTasks(first, second) {
  if (isOpenTask(first) !== isOpenTask(second)) return isOpenTask(first) ? -1 : 1;
  return first.dueDate.localeCompare(second.dueDate);
}

/**
 * Tasks matching the text and status filters, open ones first by due date.
 *
 * @param {object[]} tasks
 * @param {{ query: string, status: string }} filters
 */
export function filterTasks(tasks, { query, status }) {
  const normalizedQuery = query.trim().toLowerCase();

  return tasks
    .filter((task) => {
      const searchableText = `${task.title} ${LINK_TARGET_LABELS.get(task.linkTargetId) ?? ''}`;
      return (
        searchableText.toLowerCase().includes(normalizedQuery) &&
        (status === ALL_FILTER_VALUE || task.status === status)
      );
    })
    .sort(compareTasks);
}

export function countOpenTasks(tasks) {
  return tasks.filter(isOpenTask).length;
}

export const EMPTY_TASK_FORM_VALUES = {
  title: '',
  linkTargetId: '',
  assigneeId: '',
  priority: TASK_PRIORITIES.MEDIUM,
  dueDate: '',
};

export function toTaskFormValues(task) {
  return {
    title: task.title,
    linkTargetId: task.linkTargetId ?? '',
    assigneeId: task.assigneeId ?? '',
    priority: task.priority,
    dueDate: task.dueDate,
  };
}

function cleanFormValues(values) {
  return {
    title: values.title.trim().slice(0, MAX_TASK_TITLE_LENGTH),
    linkTargetId: values.linkTargetId || null,
    assigneeId: values.assigneeId || null,
    priority: values.priority,
    dueDate: values.dueDate,
  };
}

/** A new pending task from form values. */
export function createTask(values) {
  return { id: crypto.randomUUID(), ...cleanFormValues(values), status: TASK_STATUSES.PENDING };
}

/** Applies edited form values, keeping the task's id and status. */
export function updateTask(task, values) {
  return { ...task, ...cleanFormValues(values) };
}
