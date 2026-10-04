import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAuth } from '@/test/renderWithAuth';

import { MerchantsPanel } from './MerchantsPanel';

function getMerchantRow(name) {
  return screen.getByRole('rowheader', { name: new RegExp(`^${name}`) }).closest('tr');
}

describe('MerchantsPanel', () => {
  it('summarises the list and shows merchant details', () => {
    renderWithAuth(<MerchantsPanel />);

    expect(screen.getByText(/^6 merchants, 6 active\. Inactive merchants/)).toBeInTheDocument();
    const konkan = getMerchantRow('Konkan Fresh Mart');
    expect(konkan).toHaveTextContent('30AAGFK4444N1Z1');
    expect(konkan).toHaveTextContent('2 outlets, 1 quotation, 1 invoice, 1 receipt');
    expect(konkan).toHaveTextContent('₹24,376');
  });

  it('filters by text and by state', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPanel />);

    await user.selectOptions(screen.getByLabelText('State'), 'Goa');
    expect(screen.getAllByRole('rowheader')).toHaveLength(1);

    await user.selectOptions(screen.getByLabelText('State'), 'All states');
    await user.type(screen.getByLabelText('Filter merchants'), 'no such merchant');
    expect(screen.getByText('No merchants match these filters.')).toBeInTheDocument();
  });

  it('deactivates and reactivates a merchant', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPanel />);

    await user.click(screen.getByRole('button', { name: 'Deactivate Konkan Fresh Mart' }));

    expect(within(getMerchantRow('Konkan Fresh Mart')).getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText(/^6 merchants, 5 active\./)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Activate Konkan Fresh Mart' }));
    expect(screen.getByText(/^6 merchants, 6 active\./)).toBeInTheDocument();
  });

  it('edits a merchant in place', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPanel />);

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
    renderWithAuth(<MerchantsPanel />);

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
    renderWithAuth(<MerchantsPanel />);

    await user.click(screen.getByRole('button', { name: 'Add merchant' }));
    const form = screen.getByRole('form', { name: 'New merchant' });
    await user.type(within(form).getByLabelText('Merchant name'), 'Acme Traders');
    await user.type(within(form).getByLabelText('Mobile (10 digits)'), '9876543210');
    await user.click(within(form).getByRole('button', { name: 'Add merchant' }));

    expect(getMerchantRow('Acme Traders')).toHaveTextContent('98765 43210');
  });

  it('changes status for ticked merchants in bulk', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPanel />);

    await user.click(screen.getByLabelText('Select all shown merchants'));
    const bulkActions = screen.getByRole('group', { name: 'Bulk actions' });
    expect(within(bulkActions).getByText('6 selected')).toBeInTheDocument();

    await user.click(within(bulkActions).getByRole('button', { name: 'Mark inactive' }));

    expect(screen.getByText(/^6 merchants, 0 active\./)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });
});

describe('Merchant detail panel', () => {
  async function openDetails(user, name) {
    await user.click(screen.getByRole('button', { name }));
    return screen.getByRole('dialog', { name });
  }

  it('opens from the merchant name with the lifecycle, actions and tabs', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPanel onNavigate={vi.fn()} />);

    const panel = await openDetails(user, 'Mauli Nagri Sahakari Patsanstha Marya Majalgaon');

    expect(panel).toHaveTextContent('MER-2026-0006, Chairman, 96898 14242');
    const lifecycle = within(panel).getByRole('list', { name: 'Lifecycle' });
    expect(within(lifecycle).getByText(/^Proforma/)).toHaveTextContent('Proforma, done');
    expect(within(lifecycle).getByText(/^Invoice/)).toHaveTextContent('Invoice, not yet');
    expect(within(panel).getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(within(panel).getByRole('tab', { name: 'Outlets (0)' })).toBeInTheDocument();
  });

  it('closes with the close button and returns focus to the name', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPanel onNavigate={vi.fn()} />);

    const panel = await openDetails(user, 'Konkan Fresh Mart');
    await user.click(within(panel).getByRole('button', { name: 'Close details' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Konkan Fresh Mart' })).toHaveFocus();
  });

  it('starts a quotation on the Quotation page', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderWithAuth(<MerchantsPanel onNavigate={onNavigate} />);

    const panel = await openDetails(user, 'Konkan Fresh Mart');
    await user.click(within(panel).getByRole('button', { name: 'New quotation' }));

    expect(onNavigate).toHaveBeenCalledWith('quotations');
  });

  it('adds an outlet and updates the linked records in the list', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPanel onNavigate={vi.fn()} />);

    const panel = await openDetails(user, 'Mauli Nagri Sahakari Patsanstha Marya Majalgaon');
    await user.click(within(panel).getByRole('button', { name: 'Add outlet' }));
    await user.type(within(panel).getByLabelText('Outlet name'), 'Majalgaon Main Branch');
    await user.click(within(panel).getByRole('button', { name: 'Save outlet' }));

    expect(within(panel).getByRole('tab', { name: 'Outlets (1)' })).toBeInTheDocument();
    expect(within(panel).getByText('Majalgaon Main Branch')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(getMerchantRow('Mauli Nagri Sahakari Patsanstha Marya Majalgaon')).toHaveTextContent(
      '1 outlet, 1 quotation, 1 proforma',
    );
  });

  it('adds a remark to the timeline', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPanel onNavigate={vi.fn()} />);

    const panel = await openDetails(user, 'Konkan Fresh Mart');
    await user.click(within(panel).getByRole('button', { name: 'Add remark' }));
    await user.type(within(panel).getByLabelText('Remark'), 'Wants a second POS at Panaji');
    await user.click(within(panel).getByRole('button', { name: 'Save remark' }));

    const timeline = within(panel).getByRole('list', { name: 'Timeline' });
    expect(within(timeline).getAllByRole('listitem')[0]).toHaveTextContent(
      'Wants a second POS at Panaji',
    );
  });

  it('blocks deleting a merchant with invoices', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPanel onNavigate={vi.fn()} />);

    const panel = await openDetails(user, 'Konkan Fresh Mart');

    expect(within(panel).getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(panel).toHaveTextContent('can only be deactivated');
  });

  it('deletes a merchant after confirmation', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPanel onNavigate={vi.fn()} />);

    const panel = await openDetails(user, 'Mauli Nagri Sahakari Patsanstha Marya Majalgaon');
    await user.click(within(panel).getByRole('button', { name: 'Delete' }));
    await user.click(within(panel).getByRole('button', { name: 'Yes, delete' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/^5 merchants, 5 active\./)).toBeInTheDocument();
  });

  it('disables new quotations for inactive merchants', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPanel onNavigate={vi.fn()} />);

    const panel = await openDetails(user, 'Konkan Fresh Mart');
    await user.click(within(panel).getByRole('button', { name: 'Deactivate' }));

    expect(within(panel).getByRole('button', { name: 'New quotation' })).toBeDisabled();
    expect(within(panel).getByRole('button', { name: 'Activate' })).toBeInTheDocument();
  });
});
