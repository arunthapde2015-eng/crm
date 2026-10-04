import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NAV_IDS } from '@/constants/navigation';

import { SalesPanel } from './SalesPanel';

const TODAY = new Date(2026, 9, 1);

function renderPanel() {
  const onNavigate = vi.fn();
  const user = userEvent.setup();
  render(<SalesPanel onNavigate={onNavigate} today={TODAY} />);
  return { user, onNavigate };
}

async function openTab(user, name) {
  await user.click(screen.getByRole('tab', { name }));
}

function getRowByHeader(name) {
  return screen.getByRole('rowheader', { name: new RegExp(`^${name}`) }).closest('tr');
}

describe('SalesPanel overview', () => {
  it('shows period figures and charts, and recalculates for another period', async () => {
    const { user } = renderPanel();

    expect(screen.getByRole('button', { name: 'This quarter' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'This year' }));

    const money = screen.getByRole('region', { name: 'Sales & collections' });
    expect(within(money).getByText('₹7,62,051')).toBeInTheDocument();
    expect(within(money).getByText('₹3,31,681')).toBeInTheDocument();
    const chart = screen.getByRole('table', { name: 'Sales by salesperson' });
    expect(within(chart).getAllByRole('row')[0]).toHaveTextContent('Rohan Kulkarni₹6,02,095');
    expect(screen.getByRole('meter', { name: 'Rohan Kulkarni target achieved' })).toHaveAttribute(
      'aria-valuetext',
      '35%',
    );
  });

  it('accepts a custom date range', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Custom' }));
    const from = screen.getByLabelText('From');
    await user.clear(from);
    await user.type(from, '2026-07-01');

    const money = screen.getByRole('region', { name: 'Sales & collections' });
    expect(within(money).getByText('₹7,62,051')).toBeInTheDocument();
  });

  it('links to the existing leads, pipeline and follow-up pages', async () => {
    const { user, onNavigate } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Pipeline' }));
    await user.click(screen.getByRole('button', { name: 'Incentives' }));

    expect(onNavigate).toHaveBeenCalledWith(NAV_IDS.PIPELINE);
    expect(onNavigate).toHaveBeenCalledWith(NAV_IDS.INCENTIVES);
  });
});

describe('SalesPanel orders', () => {
  it('creates an order with a live total', async () => {
    const { user } = renderPanel();
    await openTab(user, 'Orders');

    await user.click(screen.getByRole('button', { name: 'New order' }));
    const form = screen.getByRole('form', { name: 'New order' });
    await user.type(within(form).getByLabelText('Customer'), 'Acme Traders');
    await user.type(within(form).getByLabelText('Product / service'), 'Smart POS terminal');
    await user.clear(within(form).getByLabelText('Quantity'));
    await user.type(within(form).getByLabelText('Quantity'), '2');
    await user.type(within(form).getByLabelText('Unit price (₹)'), '10000');
    expect(form).toHaveTextContent('Order total incl. GST: ₹23,600');
    await user.click(within(form).getByRole('button', { name: 'Save order' }));

    expect(getRowByHeader('ORD-2026-0011')).toHaveTextContent('Acme Traders');
  });

  it('does not offer Cancelled for an order that has payments', async () => {
    const { user } = renderPanel();
    await openTab(user, 'Orders');

    const paidStatus = screen.getByLabelText('Status of ORD-2026-0005');
    const unpaidStatus = screen.getByLabelText('Status of ORD-2026-0006');
    expect(within(paidStatus).queryByRole('option', { name: 'Cancelled' })).not.toBeInTheDocument();
    await user.selectOptions(unpaidStatus, 'Cancelled');
    expect(getRowByHeader('ORD-2026-0006')).toHaveTextContent('Not billable');
  });
});

describe('SalesPanel collections', () => {
  it('records a payment and refuses overpayment', async () => {
    const { user } = renderPanel();
    await openTab(user, 'Collections');

    await user.click(screen.getByRole('button', { name: 'Record payment' }));
    const form = screen.getByRole('form', { name: 'Record payment' });
    await user.selectOptions(within(form).getByLabelText('Order'), 'ORD-2026-0005');
    await user.type(within(form).getByLabelText('Amount (₹)'), '99999');
    await user.click(within(form).getByRole('button', { name: 'Save payment' }));
    expect(within(form).getByRole('alert')).toHaveTextContent('more than the outstanding');

    await user.clear(within(form).getByLabelText('Amount (₹)'));
    await user.type(within(form).getByLabelText('Amount (₹)'), '25815');
    await user.click(within(form).getByRole('button', { name: 'Save payment' }));

    const outstanding = screen.getByRole('table', { name: 'Outstanding orders' });
    expect(within(outstanding).queryByText('ORD-2026-0005')).not.toBeInTheDocument();
    const payments = screen.getByRole('table', { name: 'Payments received' });
    expect(within(payments).getByText('PAY-2026-0006')).toBeInTheDocument();
  });
});

describe('SalesPanel team and targets', () => {
  it('blocks a salesperson with a duplicate mobile', async () => {
    const { user } = renderPanel();
    await openTab(user, 'Sales team');

    await user.click(screen.getByRole('button', { name: 'Add salesperson' }));
    const form = screen.getByRole('form', { name: 'New salesperson' });
    await user.type(within(form).getByLabelText('Name'), 'Neha Shah');
    await user.type(within(form).getByLabelText('Mobile (10 digits)'), '9822011102');
    await user.type(within(form).getByLabelText('Email'), 'neha@finsolis.in');
    await user.type(within(form).getByLabelText('Joining date'), '2026-10-01');
    await user.type(within(form).getByLabelText('Monthly target (₹)'), '300000');
    await user.click(within(form).getByRole('button', { name: 'Save' }));

    expect(within(form).getByRole('alert')).toHaveTextContent(
      'Rohan Kulkarni already uses this mobile number or email.',
    );
  });

  it('deactivates a salesperson', async () => {
    const { user } = renderPanel();
    await openTab(user, 'Sales team');

    await user.click(screen.getByRole('button', { name: 'Deactivate Vikram Joshi' }));

    expect(getRowByHeader('Vikram Joshi')).toHaveTextContent('Inactive');
  });

  it('updates a monthly target', async () => {
    const { user } = renderPanel();
    await openTab(user, 'Targets');

    const input = screen.getByLabelText('Monthly target for Rohan Kulkarni');
    await user.clear(input);
    await user.type(input, '400000');
    await user.click(screen.getByRole('button', { name: 'Save target for Rohan Kulkarni' }));

    expect(getRowByHeader('Rohan Kulkarni')).toHaveTextContent('₹1,87,600');
    expect(screen.getByRole('meter', { name: 'Rohan Kulkarni target achieved' })).toHaveAttribute(
      'aria-valuetext',
      '53%',
    );
  });
});
