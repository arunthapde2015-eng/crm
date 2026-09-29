import { useTasks } from '../hooks/useTasks';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';

export function TasksPanel({ initialTasks }) {
  const { tasks, remainingCount, addTask, toggleTask, removeTask } = useTasks(initialTasks);

  return (
    <section aria-label="Tasks">
      <TaskForm onTaskAdd={addTask} />
      <TaskList tasks={tasks} onTaskToggle={toggleTask} onTaskRemove={removeTask} />
      <p aria-live="polite">{remainingCount} remaining</p>
    </section>
  );
}
