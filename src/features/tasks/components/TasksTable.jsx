import { DataTable } from '@/components/DataTable';

import { isOverdueTask } from '../utils/tasks';
import { TaskRow } from './TaskRow';
import styles from './TasksTable.module.css';

const COLUMN_COUNT = 7;

/**
 * @param {object} props
 * @param {object[]} props.tasks - Tasks to show, already filtered and sorted.
 * @param {string} props.todayIsoDate - Used to flag overdue tasks.
 * @param {(taskId: string, status: string) => void} props.onStatusChange
 * @param {(task: object) => void} props.onEdit
 * @param {(navId: string) => void} props.onNavigate
 */
export function TasksTable({ tasks, todayIsoDate, onStatusChange, onEdit, onNavigate }) {
  return (
    <DataTable caption="Tasks" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Task</th>
          <th scope="col">Linked to</th>
          <th scope="col">Assigned to</th>
          <th scope="col">Priority</th>
          <th scope="col">Due</th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {tasks.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No tasks match these filters.
            </td>
          </tr>
        )}
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            isOverdue={isOverdueTask(task, todayIsoDate)}
            onStatusChange={(status) => onStatusChange(task.id, status)}
            onEdit={() => onEdit(task)}
            onNavigate={onNavigate}
          />
        ))}
      </tbody>
    </DataTable>
  );
}
