import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TasksPanel } from './TasksPanel';

describe('TasksPanel', () => {
  it('shows an empty state when there are no tasks', () => {
    render(<TasksPanel initialTasks={[]} />);

    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('adds a task and clears the input', async () => {
    const user = userEvent.setup();
    render(<TasksPanel initialTasks={[]} />);

    const input = screen.getByLabelText('New task');
    await user.type(input, 'Write tests');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByRole('checkbox', { name: 'Write tests' })).not.toBeChecked();
    expect(input).toHaveValue('');
    expect(screen.getByText('1 remaining')).toBeInTheDocument();
  });

  it('disables Add when the input is blank', () => {
    render(<TasksPanel initialTasks={[]} />);

    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('toggles and removes tasks', async () => {
    const user = userEvent.setup();
    render(<TasksPanel initialTasks={[{ id: '1', title: 'Ship it', isDone: false }]} />);

    await user.click(screen.getByRole('checkbox', { name: 'Ship it' }));
    expect(screen.getByRole('checkbox', { name: 'Ship it' })).toBeChecked();
    expect(screen.getByText('0 remaining')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove Ship it' }));
    expect(screen.queryByRole('checkbox', { name: 'Ship it' })).not.toBeInTheDocument();
  });
});
