import { TasksPanel } from '@/features/tasks';

/**
 * @param {object} props
 * @param {(navId: string) => void} props.onNavigate
 */
export function TasksPage({ onNavigate }) {
  return <TasksPanel onNavigate={onNavigate} />;
}
