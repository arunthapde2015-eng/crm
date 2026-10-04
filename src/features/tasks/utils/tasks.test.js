import {
  DEFAULT_TASK_FILTERS,
  INITIAL_TASKS,
  MAX_TASK_TITLE_LENGTH,
  TASK_STATUSES,
} from '../constants';
import {
  EMPTY_TASK_FORM_VALUES,
  countOpenTasks,
  createTask,
  filterTasks,
  isOverdueTask,
  toTaskFormValues,
  updateTask,
} from './tasks';

const titles = (tasks) => tasks.map((task) => task.title);

describe('filterTasks', () => {
  it('puts open tasks first, soonest due first', () => {
    const tasks = [
      { ...INITIAL_TASKS[0], id: 'done', status: TASK_STATUSES.DONE, dueDate: '2026-01-01' },
      ...INITIAL_TASKS,
    ];

    expect(filterTasks(tasks, DEFAULT_TASK_FILTERS).map((task) => task.id)).toEqual([
      'task-1',
      'task-2',
      'task-3',
      'task-4',
      'done',
    ]);
  });

  it('matches the linked record as well as the title', () => {
    const search = (query) =>
      titles(filterTasks(INITIAL_TASKS, { ...DEFAULT_TASK_FILTERS, query }));

    expect(search('margao')).toEqual(['Collect GST certificate and cancelled cheque']);
    expect(search('BANK')).toEqual(['Reconcile September bank statement']);
  });

  it('filters by status', () => {
    const filtered = filterTasks(INITIAL_TASKS, {
      ...DEFAULT_TASK_FILTERS,
      status: TASK_STATUSES.IN_PROGRESS,
    });

    expect(titles(filtered)).toEqual(['Send revised 3-campus pricing']);
  });
});

describe('isOverdueTask', () => {
  it('flags open tasks past their due date only', () => {
    const [overdue] = INITIAL_TASKS;

    expect(isOverdueTask(overdue, '2026-09-30')).toBe(true);
    expect(isOverdueTask({ ...overdue, status: TASK_STATUSES.DONE }, '2026-09-30')).toBe(false);
    expect(isOverdueTask(overdue, '2026-09-26')).toBe(false);
  });
});

describe('countOpenTasks', () => {
  it('ignores done tasks', () => {
    const tasks = [...INITIAL_TASKS, { ...INITIAL_TASKS[0], status: TASK_STATUSES.DONE }];

    expect(countOpenTasks(tasks)).toBe(4);
  });
});

describe('createTask / updateTask', () => {
  it('creates a pending task with cleaned values', () => {
    const task = createTask({
      ...EMPTY_TASK_FORM_VALUES,
      title: `  ${'a'.repeat(MAX_TASK_TITLE_LENGTH + 5)} `,
      dueDate: '2026-10-05',
    });

    expect(task.title).toHaveLength(MAX_TASK_TITLE_LENGTH);
    expect(task).toMatchObject({
      linkTargetId: null,
      assigneeId: null,
      status: TASK_STATUSES.PENDING,
    });
  });

  it('keeps id and status when editing', () => {
    const original = INITIAL_TASKS[1];
    const updated = updateTask(original, { ...toTaskFormValues(original), title: 'New title' });

    expect(updated).toMatchObject({
      id: original.id,
      status: TASK_STATUSES.IN_PROGRESS,
      title: 'New title',
    });
  });
});
