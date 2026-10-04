import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InvoicesPanel } from './InvoicesPanel';

const TODAY = new Date(2026, 9, 3);

function renderPanel() {
  const user = userEvent.setup();
  render(<InvoicesPanel today={TODAY} />);
  return { user };
}

function getRow(number) {
  return screen.getByRole('rowheader', { name: new RegExp(`^${number}`) }).closest('tr');
}

async function openInvoice(user, number) {
  await user.click(screen.getByRole('button', { name: number }));
  return screen.getByRole('dialog', { name: `Sales invoice ${number}` });
}

describe('InvoicesPanel list', () => {
  it('summarises billing and lists invoices newest first', () => {
    renderPanel();

    expect(
      screen.getByText('11 invoices, ₹7,82,331 billed, ₹1,84,121 outstanding.'),
    ).toBeInTheDocument();
    const numbers = screen.getAllByRole('rowheader').map((cell) => cell.textContent);
    expect(numbers.slice(0, 3)).toEqual(['AMC-2026-0002AMC', 'INV-2026-0009', 'INV-2026-0008']);
    expect(getRow('INV-2026-0007')).toHaveTextContent(
      '₹40,000₹47,200₹27,200Rohan KulkarniPartially Paid',
    );
    expect(getRow('INV-2026-0005')).toHaveTextContent('₹38,145Rohan KulkarniOverdue');
    expect(getRow('INV-2026-0009')).toHaveTextContent('₹0Rohan KulkarniCancelled');
  });

  it('filters to AMC invoices only', async () => {
    const { user } = renderPanel();

    await user.selectOptions(screen.getByLabelText('Invoice type'), 'AMC only');

    expect(screen.getAllByRole('rowheader')).toHaveLength(2);
    expect(
      screen.getByText('2 invoices, ₹57,230 billed, ₹30,680 outstanding.'),
    ).toBeInTheDocument();
  });
});

describe('Invoice document', () => {
  it('prints an AMC tax invoice with taxable value and GST per line', async () => {
    const { user } = renderPanel();
    const panel = await openInvoice(user, 'AMC-2026-0002');

    expect(panel).toHaveTextContent(
      'No incentive: AMC invoices aren’t included in this salesperson’s rate.',
    );
    const document = within(panel).getByRole('article', { name: 'Invoice document AMC-2026-0002' });
    expect(
      within(document).getByRole('heading', { name: 'Tax Invoice (AMC)' }),
    ).toBeInTheDocument();
    expect(document).toHaveTextContent('Invoice Date12-Oct-2026');
    expect(document).toHaveTextContent('Due Date27-Oct-2026');
    expect(document).toHaveTextContent('PANAAATV1111K');
    const lines = within(document).getByRole('table', { name: 'Products and services' });
    expect(lines).toHaveTextContent('Annual maintenance charges, 12-10-2026 to 11-10-2027998713');
    expect(lines).toHaveTextContent('1.0026,000.0026,000.004,680.00@ 18%30,680.00');
  });
});

describe('Invoice actions', () => {
  it('records a part payment and refuses overpayment', async () => {
    const { user } = renderPanel();
    const panel = await openInvoice(user, 'INV-2026-0006');

    await user.click(within(panel).getByRole('button', { name: 'Record payment' }));
    const form = within(panel).getByRole('form', { name: 'Record payment (balance ₹63,720)' });
    const amount = within(form).getByLabelText('Amount (₹)');
    await user.clear(amount);
    await user.type(amount, '70000');
    await user.click(within(form).getByRole('button', { name: 'Save payment' }));
    expect(within(form).getByRole('alert')).toHaveTextContent('more than the balance of ₹63,720');

    await user.clear(amount);
    await user.type(amount, '30000');
    await user.type(within(form).getByLabelText('Reference'), 'UPI-1');
    await user.click(within(form).getByRole('button', { name: 'Save payment' }));

    expect(getRow('INV-2026-0006')).toHaveTextContent('₹33,720');
    const history = within(panel).getByRole('region', { name: 'Payments and notes' });
    expect(history).toHaveTextContent('Payment received by Bank transfer (UPI-1)−₹30,000');
  });

  it('raises a credit note that reduces the balance', async () => {
    const { user } = renderPanel();
    const panel = await openInvoice(user, 'INV-2026-0005');

    await user.click(within(panel).getByRole('button', { name: 'Credit / debit note' }));
    const form = within(panel).getByRole('form', {
      name: 'Credit / debit note against INV-2026-0005',
    });
    await user.type(within(form).getByLabelText('Amount incl. GST (₹)'), '8145');
    await user.type(within(form).getByLabelText('Reason'), 'Agreed discount');
    await user.click(within(form).getByRole('button', { name: 'Save note' }));

    expect(getRow('INV-2026-0005')).toHaveTextContent('₹30,000');
    expect(within(panel).getByRole('region', { name: 'Payments and notes' })).toHaveTextContent(
      'Credit note CN-2026-0001: Agreed discount−₹8,145',
    );
  });

  it('blocks cancelling an invoice that has payments', async () => {
    const { user } = renderPanel();
    const panel = await openInvoice(user, 'INV-2026-0007');

    expect(within(panel).getByRole('button', { name: 'Cancel invoice' })).toBeDisabled();
    expect(panel).toHaveTextContent('Raise a credit note instead.');
  });

  it('cancels an unpaid invoice after confirmation', async () => {
    const { user } = renderPanel();
    const panel = await openInvoice(user, 'AMC-2026-0002');

    await user.click(within(panel).getByRole('button', { name: 'Cancel invoice' }));
    await user.click(within(panel).getByRole('button', { name: 'Yes, cancel invoice' }));

    expect(getRow('AMC-2026-0002')).toHaveTextContent('Cancelled');
    expect(
      screen.getByText('11 invoices, ₹7,51,651 billed, ₹1,53,441 outstanding.'),
    ).toBeInTheDocument();
  });

  it('issues a draft, after which it can take payments', async () => {
    const { user } = renderPanel();
    const panel = await openInvoice(user, 'INV-2026-0008');

    await user.click(within(panel).getByRole('button', { name: 'Issue invoice' }));

    expect(within(panel).getByRole('button', { name: 'Record payment' })).toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: 'Edit draft' })).not.toBeInTheDocument();
    expect(getRow('INV-2026-0008')).toHaveTextContent('₹17,700Sneha PatilIssued');
  });

  it('creates and issues a new AMC invoice in its own number series', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'New invoice' }));
    const form = screen.getByRole('form', { name: 'New invoice' });
    await user.selectOptions(within(form).getByLabelText('Invoice type'), 'AMC invoice (AMC-)');
    await user.type(
      within(form).getByLabelText('Customer / merchant (M/S)'),
      'Metro Fitness Studio',
    );
    await user.type(within(form).getByLabelText('Item 1'), 'Annual maintenance charges');
    await user.type(within(form).getByLabelText('Unit price (₹), item 1'), '12000');
    await user.click(within(form).getByRole('button', { name: 'Issue invoice' }));

    expect(getRow('AMC-2026-0003')).toHaveTextContent('Metro Fitness Studio');
    expect(getRow('AMC-2026-0003')).toHaveTextContent('₹14,160Unassigned');
  });
});
