import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CustomersPanel } from './CustomersPanel';

function getCustomerRow(name) {
  return screen.getByRole('rowheader', { name: new RegExp(`^${name}`) }).closest('tr');
}

describe('CustomersPanel', () => {
  it('summarises the list and shows customer details', () => {
    render(<CustomersPanel />);

    expect(screen.getByText(/^6 customers, 6 active\. Inactive customers/)).toBeInTheDocument();
    const konkan = getCustomerRow('Konkan Fresh Mart');
    expect(konkan).toHaveTextContent('30AAGFK4444N1Z1');
    expect(konkan).toHaveTextContent('2 merchants, 1 quotation, 1 invoice, 1 receipt');
    expect(konkan).toHaveTextContent('₹24,376');
  });

  it('filters by text and by state', async () => {
    const user = userEvent.setup();
    render(<CustomersPanel />);

    await user.selectOptions(screen.getByLabelText('State'), 'Goa');
    expect(screen.getAllByRole('rowheader')).toHaveLength(1);

    await user.selectOptions(screen.getByLabelText('State'), 'All states');
    await user.type(screen.getByLabelText('Filter customers'), 'no such customer');
    expect(screen.getByText('No customers match these filters.')).toBeInTheDocument();
  });

  it('deactivates and reactivates a customer', async () => {
    const user = userEvent.setup();
    render(<CustomersPanel />);

    await user.click(screen.getByRole('button', { name: 'Deactivate Konkan Fresh Mart' }));

    expect(within(getCustomerRow('Konkan Fresh Mart')).getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText(/^6 customers, 5 active\./)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Activate Konkan Fresh Mart' }));
    expect(screen.getByText(/^6 customers, 6 active\./)).toBeInTheDocument();
  });

  it('edits a customer in place', async () => {
    const user = userEvent.setup();
    render(<CustomersPanel />);

    await user.click(screen.getByRole('button', { name: 'Edit Konkan Fresh Mart' }));
    const form = screen.getByRole('form', { name: 'Edit Konkan Fresh Mart' });
    const contactField = within(form).getByLabelText('Contact person');
    expect(within(form).getByLabelText('Customer name')).toHaveFocus();

    await user.clear(contactField);
    await user.type(contactField, 'Rita Fernandes');
    await user.click(within(form).getByRole('button', { name: 'Save changes' }));

    expect(getCustomerRow('Konkan Fresh Mart')).toHaveTextContent('CUS-2026-0004, Rita Fernandes');
    expect(screen.getAllByRole('rowheader')).toHaveLength(6);
  });

  it('copies a customer into a new record without the GSTIN', async () => {
    const user = userEvent.setup();
    render(<CustomersPanel />);

    await user.click(screen.getByRole('button', { name: 'Copy Konkan Fresh Mart' }));
    const form = screen.getByRole('form', { name: 'New customer from Konkan Fresh Mart' });
    expect(within(form).getByLabelText('GSTIN (optional)')).toHaveValue('');
    await user.click(within(form).getByRole('button', { name: 'Add customer' }));

    const copy = getCustomerRow('Konkan Fresh Mart \\(copy\\)');
    expect(copy).toHaveTextContent('CUS-2026-0007');
    expect(copy).toHaveTextContent('Goa');
    expect(screen.getByText(/^7 customers, 7 active\./)).toBeInTheDocument();
  });

  it('adds a new customer', async () => {
    const user = userEvent.setup();
    render(<CustomersPanel />);

    await user.click(screen.getByRole('button', { name: 'Add customer' }));
    const form = screen.getByRole('form', { name: 'New customer' });
    await user.type(within(form).getByLabelText('Customer name'), 'Acme Traders');
    await user.type(within(form).getByLabelText('Mobile (10 digits)'), '9876543210');
    await user.click(within(form).getByRole('button', { name: 'Add customer' }));

    expect(getCustomerRow('Acme Traders')).toHaveTextContent('98765 43210');
  });

  it('changes status for ticked customers in bulk', async () => {
    const user = userEvent.setup();
    render(<CustomersPanel />);

    await user.click(screen.getByLabelText('Select all shown customers'));
    const bulkActions = screen.getByRole('group', { name: 'Bulk actions' });
    expect(within(bulkActions).getByText('6 selected')).toBeInTheDocument();

    await user.click(within(bulkActions).getByRole('button', { name: 'Mark inactive' }));

    expect(screen.getByText(/^6 customers, 0 active\./)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });
});
