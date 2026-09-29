import { useState } from 'react';

import { Button } from '@/components/Button';

import { MAX_TASK_TITLE_LENGTH } from '../constants';
import { createTask } from '../utils/createTask';
import styles from './TaskForm.module.css';

export function TaskForm({ onTaskAdd }) {
  const [title, setTitle] = useState('');

  const isSubmitDisabled = title.trim() === '';

  function handleSubmit(event) {
    event.preventDefault();
    const task = createTask(title);
    if (!task) return;

    onTaskAdd(task);
    setTitle('');
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="new-task-title" className={styles.label}>
        New task
      </label>
      <input
        id="new-task-title"
        className={styles.input}
        value={title}
        maxLength={MAX_TASK_TITLE_LENGTH}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="What needs doing?"
      />
      <Button type="submit" disabled={isSubmitDisabled}>
        Add
      </Button>
    </form>
  );
}
