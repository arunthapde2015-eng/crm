import { MAX_TASK_TITLE_LENGTH } from '../constants';
import { createTask } from './createTask';

describe('createTask', () => {
  it('trims the title and starts not done', () => {
    const task = createTask('  Buy milk  ');

    expect(task).toMatchObject({ title: 'Buy milk', isDone: false });
    expect(task.id).toEqual(expect.any(String));
  });

  it('returns null for blank input', () => {
    expect(createTask('   ')).toBeNull();
  });

  it('truncates titles longer than the maximum length', () => {
    const task = createTask('a'.repeat(MAX_TASK_TITLE_LENGTH + 10));

    expect(task.title).toHaveLength(MAX_TASK_TITLE_LENGTH);
  });
});
