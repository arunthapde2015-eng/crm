import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MerchantsPanel } from './MerchantsPanel';

function getMerchantRow(name) {
  return screen.getByRole('rowheader', { name: new RegExp(`^${name}`) }).closest('tr');
}

describe('MerchantsPanel', () => {
  it('summarises the list and shows merchant details', () => {
    render(<MerchantsPanel />);

    expect(screen.getByText(/^6 merchants, 6 active\. Inactive merchants/)).toBeInTheDocument();
    const konkan = getMerchantRow('Konkan Fresh Mart');
    expect(konkan).toHaveTextContent('30AAGFK4444N1Z1');
    expect(konkan).toHaveTextContent('2 outlets, 1 quotation, 1 invoice, 1 receipt');
    expect(konkan).toHaveTextContent('₹24,376');
  });

  it('filters by text and by state', async () => {
    const user = userEvent.setup();
    render(<MerchantsPanel />);

    await user.selectOptions(screen.getByLabelText('State'), 'Goa');
    expect(screen.getAllByRole('rowheader')).toHaveLength(1);

    await user.selectOptions(screen.getByLabelText('State'), 'All states');
    await user.type(screen.getByLabelText('Filter merchants'), 'no such merchant');
    expect(screen.getByText('No merchants match these filters.')).toBeInTheDocument();
  });

  it('deactivates and reactivates a merchant', async () => {
    const user = userEvent.setup();
    render(<MerchantsPanel />);

    await user.click(screen.getByRole('button', { name: 'Deactivate Konkan Fresh Mart' }));

    expect(within(getMerchantRow('Konkan Fresh Mart')).getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText(/^6 merchants, 5 active\./)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Activate Konkan Fresh Mart' }));
    expect(screen.getByText(/^6 merchants, 6 active\./)).toBeInTheDocument();
  });

  it('edits a merchant in place', async () => {
    const user = userEvent.setup();
    render(<MerchantsPanel />);

    await user.click(screen.getByRole('button', { name: 'Edit Konkan Fresh Mart' }));
    const form = screen.getByRole('form', { name: 'Edit Konkan Fresh Mart' });
    const contactField = within(form).getByLabelText('Contact person');
    expect(within(form).getByLabelText('Merchant name')).toHaveFocus();

    await user.clear(contactField);
    await user.type(contactField, 'Rita Fernandes');
    await user.click(within(form).getByRole('button', { name: 'Save changes' }));

    expect(getMerchantRow('Konkan Fresh Mart')).toHaveTextContent('MER-2026-0004, Rita Fernandes');
    expect(screen.getAllByRole('rowheader')).toHaveLength(6);
  });

  it('copies a merchant into a new record without the GSTIN', async () => {
    const user = userEvent.setup();
    render(<MerchantsPanel />);

    await user.click(screen.getByRole('button', { name: 'Copy Konkan Fresh Mart' }));
    const form = screen.getByRole('form', { name: 'New merchant from Konkan Fresh Mart' });
    expect(within(form).getByLabelText('GSTIN (optional)')).toHaveValue('');
    await user.click(within(form).getByRole('button', { name: 'Add merchant' }));

    const copy = getMerchantRow('Konkan Fresh Mart \\(copy\\)');
    expect(copy).toHaveTextContent('MER-2026-0007');
    expect(copy).toHaveTextContent('Goa');
    expect(screen.getByText(/^7 merchants, 7 active\./)).toBeInTheDocument();
  });

  it('adds a new merchant', async () => {
    const user = userEvent.setup();
    render(<MerchantsPanel />);

    await user.click(screen.getByRole('button', { name: 'Add merchant' }));
    const form = screen.getByRole('form', { name: 'New merchant' });
    await user.type(within(form).getByLabelText('Merchant name'), 'Acme Traders');
    await user.type(within(form).getByLabelText('Mobile (10 digits)'), '9876543210');
    await user.click(within(form).getByRole('button', { name: 'Add merchant' }));

    expect(getMerchantRow('Acme Traders')).toHaveTextContent('98765 43210');
  });

  it('changes status for ticked merchants in bulk', async () => {
    const user = userEvent.setup();
    render(<MerchantsPanel />);

    await user.click(screen.getByLabelText('Select all shown merchants'));
    const bulkActions = screen.getByRole('group', { name: 'Bulk actions' });
    expect(within(bulkActions).getByText('6 selected')).toBeInTheDocument();

    await user.click(within(bulkActions).getByRole('button', { name: 'Mark inactive' }));

    expect(screen.getByText(/^6 merchants, 0 active\./)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });
});
