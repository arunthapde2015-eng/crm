import { useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { toIsoDate } from '@/utils/formatDate';

import { DEFAULT_TASK_FILTERS } from '../constants';
import { useTasks } from '../hooks/useTasks';
import {
  EMPTY_TASK_FORM_VALUES,
  countOpenTasks,
  createTask,
  filterTasks,
  toTaskFormValues,
} from '../utils/tasks';
import { TaskFilters } from './TaskFilters';
import { TaskForm } from './TaskForm';
import { TasksTable } from './TasksTable';
import styles from './TasksPanel.module.css';

/**
 * @param {object} props
 * @param {(navId: string) => void} props.onNavigate - Opens a linked record's page.
 * @param {object[]} [props.initialTasks]
 * @param {Date} [props.today] - Reference date for overdue highlighting; injectable for tests.
 */
export function TasksPanel({ onNavigate, initialTasks, today = new Date() }) {
  const { tasks, addTask, updateTask, setTaskStatus } = useTasks(initialTasks);
  const [filters, setFilters] = useState(DEFAULT_TASK_FILTERS);
  // null when closed; { task: null } to add; { task } to edit that task.
  const [openForm, setOpenForm] = useState(null);

  const visibleTasks = filterTasks(tasks, filters);
  const editingTask = openForm?.task ?? null;

  function handleFilterChange(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function handleFormSubmit(values) {
    if (editingTask) updateTask(editingTask.id, values);
    else addTask(createTask(values));
    setOpenForm(null);
  }

  return (
    <>
      <PageHeader
        title="Tasks"
        description={`${countOpenTasks(tasks)} open.`}
        actions={<Button onClick={() => setOpenForm({ task: null })}>Add task</Button>}
      />
      <div className={styles.body}>
        {openForm && (
          <TaskForm
            key={editingTask?.id ?? 'new'}
            title={editingTask ? 'Edit task' : 'New task'}
            submitLabel={editingTask ? 'Save changes' : 'Add task'}
            initialValues={editingTask ? toTaskFormValues(editingTask) : EMPTY_TASK_FORM_VALUES}
            onSubmit={handleFormSubmit}
            onCancel={() => setOpenForm(null)}
          />
        )}
        <TaskFilters filters={filters} onFilterChange={handleFilterChange} />
        <TasksTable
          tasks={visibleTasks}
          todayIsoDate={toIsoDate(today)}
          onStatusChange={setTaskStatus}
          onEdit={(task) => setOpenForm({ task })}
          onNavigate={onNavigate}
        />
      </div>
    </>
  );
}
