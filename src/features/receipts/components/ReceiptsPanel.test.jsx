import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReceiptsPanel } from './ReceiptsPanel';

const TODAY = new Date(2026, 9, 3);

function renderPanel() {
  const user = userEvent.setup();
  render(<ReceiptsPanel today={TODAY} />);
  return { user };
}

function getRow(number) {
  return screen.getByRole('rowheader', { name: new RegExp(`^${number}`) }).closest('tr');
}

async function openReceipt(user, number) {
  await user.click(screen.getByRole('button', { name: number }));
  return screen.getByRole('dialog', { name: `Receipt ${number}` });
}

describe('ReceiptsPanel list', () => {
  it('shows the total collected and lists receipts newest first', () => {
    renderPanel();

    expect(screen.getByText('13 receipts, ₹5,74,610 collected.')).toBeInTheDocument();
    expect(getRow('REC-2026-0007')).toHaveTextContent(
      '24-09-2026Nirmal Co-operative Credit SocietyINV-2026-0007NEFTUTR294034404HDFC Bank current account₹20,000',
    );
    expect(screen.getAllByRole('rowheader')[3]).toHaveTextContent('REC-2026-0003');
  });

  it('filters by customer text', async () => {
    const { user } = renderPanel();

    await user.type(screen.getByLabelText('Filter receipts'), 'konkan');

    expect(screen.getAllByRole('rowheader')).toHaveLength(2);
    expect(screen.getByText('2 receipts, ₹57,700 collected.')).toBeInTheDocument();
  });
});

describe('Recording a payment', () => {
  it('fills the balance, checks references and opens the new receipt', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Record payment' }));
    const form = screen.getByRole('form', { name: 'Record payment' });
    await user.selectOptions(within(form).getByLabelText('Against invoice'), 'INV-2026-0006');
    expect(within(form).getByLabelText('Amount (₹)')).toHaveValue(63720);

    await user.type(within(form).getByLabelText('UTR / transaction / cheque no.'), 'UTR294034404');
    await user.click(within(form).getByRole('button', { name: 'Save receipt' }));
    expect(within(form).getByRole('alert')).toHaveTextContent(
      'Reference UTR294034404 is already used on REC-2026-0007.',
    );

    const reference = within(form).getByLabelText('UTR / transaction / cheque no.');
    await user.clear(reference);
    await user.type(reference, 'UTR777000111');
    await user.click(within(form).getByRole('button', { name: 'Save receipt' }));

    const panel = screen.getByRole('dialog', { name: 'Receipt REC-2026-0009' });
    const document = within(panel).getByRole('article', { name: 'Receipt document REC-2026-0009' });
    expect(within(document).getByRole('heading', { name: 'Payment Receipt' })).toBeInTheDocument();
    expect(document).toHaveTextContent('Received fromVidya Vikas School Trust');
    expect(document).toHaveTextContent('₹63,720.00');
    expect(document).toHaveTextContent('SIXTY-THREE THOUSAND SEVEN HUNDRED TWENTY RUPEES ONLY');
    expect(screen.getByText('14 receipts, ₹6,38,330 collected.')).toBeInTheDocument();
  });

  it('suggests the cash account and allows no reference for cash', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Record payment' }));
    const form = screen.getByRole('form', { name: 'Record payment' });
    await user.selectOptions(within(form).getByLabelText('Against invoice'), 'INV-2026-0002');
    await user.selectOptions(within(form).getByLabelText('Mode'), 'Cash');

    expect(within(form).getByLabelText('Deposited to')).toHaveValue('Cash in hand');
    await user.click(within(form).getByRole('button', { name: 'Save receipt' }));
    expect(screen.getByRole('dialog', { name: 'Receipt REC-2026-0009' })).toHaveTextContent(
      '₹5,900.00',
    );
  });
});

describe('Voiding a receipt', () => {
  it('marks a cheque bounced with a reason and keeps it on record', async () => {
    const { user } = renderPanel();
    const panel = await openReceipt(user, 'REC-2026-0006');

    await user.click(within(panel).getByRole('button', { name: 'Mark bounced' }));
    const form = within(panel).getByRole('form', { name: 'Mark this payment as bounced?' });
    expect(within(form).getByRole('button', { name: 'Mark bounced' })).toBeDisabled();
    await user.type(within(form).getByLabelText('Reason'), 'Cheque returned unpaid');
    await user.click(within(form).getByRole('button', { name: 'Mark bounced' }));

    const document = within(panel).getByRole('article', { name: 'Receipt document REC-2026-0006' });
    expect(document).toHaveTextContent('Bounced: Cheque returned unpaid');
    expect(document).toHaveTextContent('Cheque payments are subject to realisation.');
    expect(getRow('REC-2026-0006')).toHaveTextContent('Bounced');
    expect(screen.getByText('13 receipts, ₹5,44,610 collected.')).toBeInTheDocument();
  });

  it('offers no bounce for cash, only cancel', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Record payment' }));
    const form = screen.getByRole('form', { name: 'Record payment' });
    await user.selectOptions(within(form).getByLabelText('Against invoice'), 'INV-2026-0002');
    await user.selectOptions(within(form).getByLabelText('Mode'), 'Cash');
    await user.click(within(form).getByRole('button', { name: 'Save receipt' }));

    const panel = screen.getByRole('dialog', { name: 'Receipt REC-2026-0009' });
    expect(within(panel).queryByRole('button', { name: 'Mark bounced' })).not.toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Cancel receipt' })).toBeInTheDocument();
  });
});
