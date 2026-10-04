import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NAV_IDS } from '@/constants/navigation';

import { TasksPanel } from './TasksPanel';

const TODAY = new Date(2026, 9, 1);

function renderPanel(props = {}) {
  const onNavigate = vi.fn();
  render(<TasksPanel onNavigate={onNavigate} today={TODAY} {...props} />);
  return { onNavigate };
}

function getTaskRow(title) {
  return screen.getByRole('rowheader', { name: title }).closest('tr');
}

describe('TasksPanel', () => {
  it('lists open tasks and flags overdue ones', () => {
    renderPanel();

    expect(screen.getByText('4 open.')).toBeInTheDocument();
    expect(getTaskRow('Follow up on AMC renewal payment')).toHaveTextContent(
      '26-09-2026 (overdue)',
    );
    expect(getTaskRow('Reconcile September bank statement')).not.toHaveTextContent('overdue');
    expect(getTaskRow('Reconcile September bank statement')).toHaveTextContent('Meera Iyer');
  });

  it('opens the linked record', async () => {
    const user = userEvent.setup();
    const { onNavigate } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Konkan Fresh Mart, Margao' }));

    expect(onNavigate).toHaveBeenCalledWith(NAV_IDS.CUSTOMERS);
  });

  it('marks a task done from its status menu', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.selectOptions(
      screen.getByLabelText('Status of Send revised 3-campus pricing'),
      'Done',
    );

    expect(screen.getByText('3 open.')).toBeInTheDocument();
    expect(getTaskRow('Send revised 3-campus pricing')).not.toHaveTextContent('overdue');
  });

  it('filters by text and by status', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.selectOptions(screen.getByLabelText('Status'), 'In Progress');
    expect(screen.getAllByRole('rowheader')).toHaveLength(1);

    await user.selectOptions(screen.getByLabelText('Status'), 'All statuses');
    await user.type(screen.getByLabelText('Filter tasks'), 'no such task');
    expect(screen.getByText('No tasks match these filters.')).toBeInTheDocument();
  });

  it('adds a task', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Add task' }));
    const form = screen.getByRole('form', { name: 'New task' });
    expect(within(form).getByLabelText('Task')).toHaveFocus();

    await user.type(within(form).getByLabelText('Task'), 'Call Nirmal about renewal');
    await user.selectOptions(within(form).getByLabelText('Assigned to'), 'Vikram Joshi');
    await user.type(within(form).getByLabelText('Due'), '2026-10-05');
    await user.click(within(form).getByRole('button', { name: 'Add task' }));

    expect(getTaskRow('Call Nirmal about renewal')).toHaveTextContent('Vikram Joshi');
    expect(screen.getByText('5 open.')).toBeInTheDocument();
  });

  it('edits a task', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(
      screen.getByRole('button', { name: 'Edit Reconcile September bank statement' }),
    );
    const form = screen.getByRole('form', { name: 'Edit task' });
    await user.selectOptions(within(form).getByLabelText('Priority'), 'High');
    await user.click(within(form).getByRole('button', { name: 'Save changes' }));

    expect(getTaskRow('Reconcile September bank statement')).toHaveTextContent('High');
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });
});
