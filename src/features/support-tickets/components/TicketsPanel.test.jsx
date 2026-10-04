import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAuth } from '@/test/renderWithAuth';

import { TicketsPanel } from './TicketsPanel';

const TODAY = new Date(2026, 9, 4);

function renderPanel() {
  const user = userEvent.setup();
  renderWithAuth(<TicketsPanel today={TODAY} />);
  return { user };
}

const getRow = (number) =>
  screen.getByRole('rowheader', { name: new RegExp(`^${number}`) }).closest('tr');

describe('TicketsPanel', () => {
  it('lists tickets with status counts and overdue dates', () => {
    renderPanel();

    expect(
      screen.getByText(
        '3 open, 3 past due, 0 assigned to you. Closed tickets are hidden unless you filter by status.',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual([
      'TKT-2026-000224-09-2026',
      'TKT-2026-000128-09-2026',
      'TKT-2026-000426-09-2026',
      'TKT-2026-000322-09-2026',
    ]);
    expect(getRow('TKT-2026-0002')).toHaveTextContent(
      'Parents unable to pay fees through appVidya Vikas School, WakadTechnical issueHighRohan Kulkarni25-09-2026OverdueIn Progress',
    );
    expect(getRow('TKT-2026-0003')).not.toHaveTextContent('Overdue');
  });

  it('filters by assignee', async () => {
    const { user } = renderPanel();

    await user.selectOptions(screen.getByLabelText('Assigned to'), 'priya');

    expect(screen.getAllByRole('rowheader')).toHaveLength(2);
  });

  it('raises a ticket and opens it', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Raise ticket' }));
    const form = screen.getByRole('form', { name: 'Raise ticket' });
    await user.type(within(form).getByLabelText('Merchant or customer'), 'Royal Caterers');
    await user.type(within(form).getByLabelText('Subject'), 'Settlement not received');
    await user.selectOptions(within(form).getByLabelText('Priority'), 'high');
    expect(form).toHaveTextContent('Due 05-10-2026, based on the priority.');
    await user.type(within(form).getByLabelText('Description'), 'Card settlement missing.');
    await user.click(within(form).getByRole('button', { name: 'Save ticket' }));

    const drawer = screen.getByRole('dialog', { name: 'TKT-2026-0005: Settlement not received' });
    expect(drawer).toHaveTextContent('Ticket raised.04-10-2026, Anita Deshpande');
    expect(screen.getByText(/^4 open, 3 past due/)).toBeInTheDocument();
  });

  it('resolves a ticket only with a note, and logs it', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'TKT-2026-0001' }));
    const drawer = screen.getByRole('dialog', {
      name: 'TKT-2026-0001: POS terminal not printing receipts',
    });
    const form = within(drawer).getByRole('form', { name: 'Update ticket' });
    await user.selectOptions(within(form).getByLabelText('Status'), 'resolved');
    await user.click(within(form).getByRole('button', { name: 'Save update' }));
    expect(within(form).getByRole('alert')).toHaveTextContent('Add a note on how it was resolved.');

    await user.type(
      within(form).getByLabelText('How was it resolved?'),
      'Replaced the print head.',
    );
    await user.click(within(form).getByRole('button', { name: 'Save update' }));

    expect(within(drawer).getAllByRole('listitem')[0]).toHaveTextContent(
      'Status changed to Resolved. Replaced the print head.04-10-2026, Anita Deshpande',
    );
    expect(getRow('TKT-2026-0001')).toHaveTextContent('Resolved');
    expect(screen.getByText(/^2 open, 2 past due/)).toBeInTheDocument();
  });
});
