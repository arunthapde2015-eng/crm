import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LeadsPanel } from './LeadsPanel';

function getLeadRow(name) {
  return screen.getByRole('rowheader', { name: new RegExp(`^${name}`) }).closest('tr');
}

describe('LeadsPanel', () => {
  it('summarises the list, the unassigned leads and team workload', () => {
    render(<LeadsPanel />);

    expect(screen.getByText(/18 of 18 leads\. Pipeline value ₹9,41,600\./)).toBeInTheDocument();
    expect(screen.getByText('2 unassigned.')).toBeInTheDocument();
    expect(
      screen.getByText('Team workload (open leads): Vikram 0, Rohan 5, Sneha 5'),
    ).toBeInTheDocument();
  });

  it('filters by text and by status', async () => {
    const user = userEvent.setup();
    render(<LeadsPanel />);

    await user.type(screen.getByLabelText('Filter leads'), 'konkan');
    expect(screen.getAllByRole('rowheader')).toHaveLength(1);
    expect(screen.getByText(/1 of 18 leads\. Pipeline value ₹75,000\./)).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Filter leads'));
    await user.selectOptions(screen.getByLabelText('Status'), 'Lost');
    expect(screen.getAllByRole('rowheader')).toHaveLength(2);
  });

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup();
    render(<LeadsPanel />);

    await user.type(screen.getByLabelText('Filter leads'), 'no such lead');

    expect(screen.getByText('No leads match these filters.')).toBeInTheDocument();
  });

  it('spreads unassigned leads across the team', async () => {
    const user = userEvent.setup();
    render(<LeadsPanel />);

    await user.click(screen.getByRole('button', { name: 'Assign 2 unassigned' }));

    expect(screen.queryByRole('button', { name: /unassigned$/ })).not.toBeInTheDocument();
    expect(
      within(getLeadRow('Satara Hardware Mart')).getByText('Vikram Joshi'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Team workload (open leads): Vikram 2, Rohan 5, Sneha 5'),
    ).toBeInTheDocument();
  });

  it('reassigns a single lead', async () => {
    const user = userEvent.setup();
    render(<LeadsPanel />);

    await user.click(screen.getByRole('button', { name: 'Reassign Konkan Fresh Mart' }));
    await user.selectOptions(
      screen.getByLabelText('Salesperson for Konkan Fresh Mart'),
      'Rohan Kulkarni',
    );

    expect(within(getLeadRow('Konkan Fresh Mart')).getByText('Rohan Kulkarni')).toBeInTheDocument();
  });

  it('assigns ticked leads in bulk', async () => {
    const user = userEvent.setup();
    render(<LeadsPanel />);

    await user.click(screen.getByLabelText('Select Satara Hardware Mart'));
    await user.click(screen.getByLabelText('Select Om Sai Travels'));
    const bulkBar = screen.getByRole('form', { name: 'Bulk assign' });
    expect(within(bulkBar).getByText('2 selected')).toBeInTheDocument();

    await user.selectOptions(within(bulkBar).getByLabelText('Assign to'), 'Sneha Patil');
    await user.click(within(bulkBar).getByRole('button', { name: 'Assign selected' }));

    expect(within(getLeadRow('Om Sai Travels')).getByText('Sneha Patil')).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Bulk assign' })).not.toBeInTheDocument();
  });

  it('adds a new lead to the list', async () => {
    const user = userEvent.setup();
    render(<LeadsPanel />);

    await user.click(screen.getByRole('button', { name: 'Add lead' }));
    const form = screen.getByRole('form', { name: 'New lead' });
    await user.type(within(form).getByLabelText('Lead / organisation name'), 'Acme Traders');
    await user.type(within(form).getByLabelText('Contact person'), 'Ravi Kumar');
    await user.type(within(form).getByLabelText('Mobile (10 digits)'), '9876543210');
    await user.type(within(form).getByLabelText('Value (₹)'), '25000');
    await user.click(within(form).getByRole('button', { name: 'Save lead' }));

    expect(screen.queryByRole('form', { name: 'New lead' })).not.toBeInTheDocument();
    expect(getLeadRow('Acme Traders')).toHaveTextContent('LD-2026-0019, Ravi Kumar');
    expect(screen.getByText('3 unassigned.')).toBeInTheDocument();
  });
});
