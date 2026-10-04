import { BADGE_TONES, Badge } from '@/components/Badge';
import { TEAM_MEMBER_NAMES } from '@/constants/team';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import {
  LINK_TARGETS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from '../constants';
import styles from './TasksTable.module.css';

const LINK_TARGETS_BY_ID = new Map(LINK_TARGETS.map((target) => [target.id, target]));

const PRIORITY_TONES = {
  [TASK_PRIORITIES.HIGH]: BADGE_TONES.WARNING,
  [TASK_PRIORITIES.MEDIUM]: BADGE_TONES.INFO,
  [TASK_PRIORITIES.LOW]: BADGE_TONES.NEUTRAL,
};

/**
 * @param {object} props
 * @param {object} props.task
 * @param {boolean} props.isOverdue
 * @param {(status: string) => void} props.onStatusChange
 * @param {() => void} props.onEdit
 * @param {(navId: string) => void} props.onNavigate - Opens the linked record's page.
 */
export function TaskRow({ task, isOverdue, onStatusChange, onEdit, onNavigate }) {
  const linkTarget = LINK_TARGETS_BY_ID.get(task.linkTargetId);
  const isDone = task.status === TASK_STATUSES.DONE;
  const statusSelectId = `task-status-${task.id}`;

  return (
    <tr className={isDone ? styles.doneRow : undefined}>
      <th scope="row" className={styles.titleCell}>
        {task.title}
      </th>
      <td>
        {linkTarget ? (
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => onNavigate(linkTarget.navId)}
          >
            {linkTarget.label}
          </button>
        ) : (
          <>
            <span aria-hidden="true">—</span>
            <span className="visually-hidden">Nothing linked</span>
          </>
        )}
      </td>
      <td>{TEAM_MEMBER_NAMES.get(task.assigneeId) ?? 'Unassigned'}</td>
      <td>
        <Badge tone={PRIORITY_TONES[task.priority]}>{TASK_PRIORITY_LABELS[task.priority]}</Badge>
      </td>
      <td className={`${styles.nowrap} ${isOverdue ? styles.overdue : ''}`}>
        {formatDayMonthYear(parseIsoDate(task.dueDate))}
        {isOverdue && (
          <>
            {' '}
            <span className="visually-hidden">(overdue)</span>
          </>
        )}
      </td>
      <td>
        <label htmlFor={statusSelectId} className="visually-hidden">
          Status of {task.title}
        </label>
        <select
          id={statusSelectId}
          className={styles.statusSelect}
          value={task.status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className={styles.actionCell}>
        <button type="button" className={styles.editButton} onClick={onEdit}>
          Edit <span className="visually-hidden">{task.title}</span>
        </button>
      </td>
    </tr>
  );
}
