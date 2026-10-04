import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IncentivesPanel } from './IncentivesPanel';

const TODAY = new Date(2026, 9, 1);

function renderPanel() {
  const user = userEvent.setup();
  render(<IncentivesPanel today={TODAY} />);
  return { user };
}

function getTotals() {
  return screen.getByRole('region', { name: 'Incentive totals' });
}

function getSummaryRow(name) {
  return screen.getByRole('rowheader', { name: new RegExp(name) }).closest('tr');
}

describe('IncentivesPanel summary', () => {
  it('shows the headline figures and each salesperson', () => {
    renderPanel();

    const totals = getTotals();
    expect(totals).toHaveTextContent('7Total orders');
    expect(totals).toHaveTextContent('₹10,495Incentive earned');
    expect(totals).toHaveTextContent('₹5,860Incentive paid');
    expect(totals).toHaveTextContent('₹4,635Unpaid / pending');
    expect(totals).toHaveTextContent('4Orders awaiting payout');

    const rohan = getSummaryRow('Rohan Kulkarni');
    expect(rohan).toHaveTextContent('Slabs on order value, whole amount at the slab reached');
    expect(rohan).toHaveTextContent('5₹7,495₹4,360₹3,1353since 13-08-2026');
    expect(getSummaryRow('Sneha Patil')).toHaveTextContent('₹1,500 per order');
    expect(
      within(getSummaryRow('Vikram Joshi')).queryByRole('button', { name: /Pay all pending/ }),
    ).not.toBeInTheDocument();
  });

  it('pays all pending incentives for a salesperson', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Pay all pending for Rohan Kulkarni' }));
    const form = screen.getByRole('form', { name: 'Pay Rohan Kulkarni ₹3,135 for 3 orders' });
    await user.type(within(form).getByLabelText('Reference'), 'NEFT-99');
    await user.click(within(form).getByRole('button', { name: 'Confirm payout' }));

    expect(getTotals()).toHaveTextContent('₹8,995Incentive paid');
    expect(getTotals()).toHaveTextContent('₹1,500Unpaid / pending');
    expect(getSummaryRow('Rohan Kulkarni')).toHaveTextContent('₹0');

    await user.click(screen.getByRole('tab', { name: 'Payout history' }));
    const latest = screen.getAllByRole('rowheader')[0].closest('tr');
    expect(latest).toHaveTextContent('PO-2026-0003');
    expect(latest).toHaveTextContent('ORD-2026-0005, ORD-2026-0006, ORD-2026-0007');
    expect(latest).toHaveTextContent('NEFT-99₹3,135');
  });

  it('filters the figures by salesperson and payout state', async () => {
    const { user } = renderPanel();

    await user.selectOptions(screen.getByLabelText('Salesperson'), 'Sneha Patil');
    expect(getTotals()).toHaveTextContent('2Total orders');

    await user.selectOptions(screen.getByLabelText('Payout'), 'Unpaid only');
    expect(getTotals()).toHaveTextContent('1Total orders');
    expect(getTotals()).toHaveTextContent('₹1,500Unpaid / pending');
  });
});

describe('IncentivesPanel orders and rates', () => {
  it('opens one salesperson’s orders and pays a single order', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'View orders for Sneha Patil' }));

    expect(screen.getByRole('tab', { name: 'Order-wise incentives' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getAllByRole('rowheader')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Mark paid ORD-2026-0003' }));
    await user.click(screen.getByRole('button', { name: 'Confirm payout' }));

    const row = screen.getByRole('rowheader', { name: /^ORD-2026-0003/ }).closest('tr');
    expect(row).toHaveTextContent('PaidPO-2026-0003');
  });

  it('changes a rate, re-pricing unpaid orders only', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Set rate for Rohan Kulkarni' }));
    const editor = screen.getByRole('form', { name: 'Incentive rate for Rohan Kulkarni' });
    expect(within(editor).getByLabelText('Calculate as')).toHaveFocus();

    await user.selectOptions(
      within(editor).getByLabelText('Calculate as'),
      'Fixed amount per order',
    );
    await user.type(within(editor).getByLabelText('Amount per order (₹)'), '1000');
    await user.click(within(editor).getByRole('button', { name: 'Save rate' }));
    expect(within(editor).getByRole('status')).toHaveTextContent('Saved: ₹1,000 per order');

    await user.click(screen.getByRole('tab', { name: 'Salesperson summary' }));
    // Paid ₹4,360 stays; the three unpaid orders are now ₹1,000 each.
    expect(getSummaryRow('Rohan Kulkarni')).toHaveTextContent(
      '₹1,000 per order5₹7,360₹4,360₹3,000',
    );
  });

  it('refuses overlapping slabs', async () => {
    const { user } = renderPanel();
    await user.click(screen.getByRole('tab', { name: 'Incentive rates' }));
    const editor = screen.getByRole('form', { name: 'Incentive rate for Vikram Joshi' });

    const limit = within(editor).getByLabelText('Vikram Joshi slab 2 upper limit');
    await user.clear(limit);
    await user.type(limit, '40000');
    await user.click(within(editor).getByRole('button', { name: 'Save rate' }));

    expect(within(editor).getByRole('alert')).toHaveTextContent(
      'Slab 2: upper limit must be more than ₹50,000.',
    );
  });
});
