import { Button } from '@/components/Button';

import styles from './TaskList.module.css';

export function TaskList({ tasks, onTaskToggle, onTaskRemove }) {
  if (tasks.length === 0) {
    return <p className={styles.empty}>No tasks yet — add one above.</p>;
  }

  return (
    <ul className={styles.list}>
      {tasks.map((task) => (
        <li key={task.id} className={styles.item}>
          <label className={task.isDone ? styles.done : undefined}>
            <input type="checkbox" checked={task.isDone} onChange={() => onTaskToggle(task.id)} />{' '}
            {task.title}
          </label>
          <Button
            variant="ghost"
            aria-label={`Remove ${task.title}`}
            onClick={() => onTaskRemove(task.id)}
          >
            ✕
          </Button>
        </li>
      ))}
    </ul>
  );
}
