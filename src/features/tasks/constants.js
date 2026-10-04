import { NAV_IDS } from '@/constants/navigation';

export const MAX_TASK_TITLE_LENGTH = 120;

export const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUSES.PENDING]: 'Pending',
  [TASK_STATUSES.IN_PROGRESS]: 'In Progress',
  [TASK_STATUSES.DONE]: 'Done',
};

export const TASK_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITIES.HIGH]: 'High',
  [TASK_PRIORITIES.MEDIUM]: 'Medium',
  [TASK_PRIORITIES.LOW]: 'Low',
};

export const ALL_FILTER_VALUE = 'all';

export const DEFAULT_TASK_FILTERS = {
  query: '',
  status: ALL_FILTER_VALUE,
};

// Records a task can point at, and the page that opens when the link is clicked.
// Placeholder list until tasks can link to real merchant and lead records.
export const LINK_TARGETS = [
  { id: 'vidya-vikas', label: 'Vidya Vikas School, Baner', navId: NAV_IDS.MERCHANTS },
  { id: 'deccan-institute', label: 'Deccan Institute of Management', navId: NAV_IDS.LEADS },
  { id: 'konkan-fresh-mart', label: 'Konkan Fresh Mart, Margao', navId: NAV_IDS.MERCHANTS },
  { id: 'nirmal-credit', label: 'Nirmal Co-operative Credit Society', navId: NAV_IDS.MERCHANTS },
  { id: 'metro-fitness', label: 'Metro Fitness Studio', navId: NAV_IDS.LEADS },
];

const { PENDING, IN_PROGRESS } = TASK_STATUSES;
const { HIGH, MEDIUM } = TASK_PRIORITIES;

// Placeholder tasks until the tasks API exists. Due dates are ISO (YYYY-MM-DD).
// Formatting is skipped so each task stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_TASKS = [
  task(1, 'Follow up on AMC renewal payment', 'vidya-vikas', 'rohan', HIGH, '2026-09-26', PENDING),
  task(2, 'Send revised 3-campus pricing', 'deccan-institute', 'rohan', HIGH, '2026-09-27', IN_PROGRESS),
  task(3, 'Collect GST certificate and cancelled cheque', 'konkan-fresh-mart', 'sneha', MEDIUM, '2026-09-29', PENDING),
  task(4, 'Reconcile September bank statement', null, 'meera', MEDIUM, '2026-10-01', PENDING),
];

function task(sequence, title, linkTargetId, assigneeId, priority, dueDate, status) {
  return { id: `task-${sequence}`, title, linkTargetId, assigneeId, priority, dueDate, status };
}
