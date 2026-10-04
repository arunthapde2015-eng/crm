import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AmcPanel } from './AmcPanel';

const TODAY = new Date(2026, 9, 3);

function renderPanel() {
  const user = userEvent.setup();
  const onNavigate = vi.fn();
  render(<AmcPanel onNavigate={onNavigate} today={TODAY} />);
  return { user, onNavigate };
}

function getRow(name) {
  return screen.getByRole('rowheader', { name: new RegExp(`^${name}`) }).closest('tr');
}

function getStat(label) {
  const summary = screen.getByRole('region', { name: 'AMC summary' });
  return within(summary).getByText(label).closest('li');
}

describe('AmcPanel', () => {
  it('shows the summary and each contract with its reminder and renewal', () => {
    renderPanel();

    expect(
      screen.getByText(
        'Reminders go out 90, 60, 30, 15 and 7 days before expiry, and on the expiry date. Change this in Settings.',
      ),
    ).toBeInTheDocument();
    expect(getStat('Expiring soon')).toHaveTextContent('1');
    expect(getStat('AMC revenue billed')).toHaveTextContent('₹1,79,000');
    expect(getStat('AMC dues outstanding')).toHaveTextContent('₹30,680');

    expect(getRow('Sahyadri Clinic, Kothrud')).toHaveTextContent(
      '23-08-2025 to 22-08-2026-42Expired 42 days ago₹18,000—Expired',
    );
    const baner = getRow('Vidya Vikas School, Baner');
    expect(baner).toHaveTextContent('15-day reminder₹24,000Pending₹26,000 from 12-10-2026');
    expect(within(baner).queryByRole('button', { name: /Renew/ })).not.toBeInTheDocument();
  });

  it('filters by status', async () => {
    const { user } = renderPanel();

    await user.selectOptions(screen.getByLabelText('Status'), 'active');

    expect(screen.getAllByRole('rowheader')).toHaveLength(3);
  });

  it('renews an expired AMC and marks the renewal paid', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Renew Sahyadri Clinic, Kothrud' }));
    const form = screen.getByRole('form', { name: 'Renew AMC: Sahyadri Clinic, Kothrud' });
    expect(within(form).getByLabelText('Starts on')).toHaveValue('2026-08-23');
    const amount = within(form).getByLabelText('Amount (₹, before GST)');
    await user.clear(amount);
    await user.type(amount, '20000');
    await user.click(within(form).getByRole('button', { name: 'Create renewal invoice' }));

    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    const row = getRow('Sahyadri Clinic, Kothrud');
    expect(row).toHaveTextContent('23-08-2026 to 22-08-2027323');
    expect(row).toHaveTextContent('Pending₹20,000 from 23-08-2026');
    expect(getStat('AMC dues outstanding')).toHaveTextContent('₹54,280');

    await user.click(within(row).getByRole('button', { name: 'Mark AMC-2026-0003 paid' }));
    // The renewal has already started, so once paid it is simply the current year.
    expect(getRow('Sahyadri Clinic, Kothrud')).toHaveTextContent('323₹20,000—Active');
    expect(getStat('AMC dues outstanding')).toHaveTextContent('₹30,680');
  });
});

describe('Merchant detail panel', () => {
  async function openMerchant(user, name) {
    await user.click(screen.getByRole('button', { name }));
    return screen.getByRole('dialog', { name });
  }

  it('opens from the merchant name with lifecycle, actions and overview', async () => {
    const { user } = renderPanel();
    const panel = await openMerchant(user, 'Sahyadri Clinic, Kothrud');

    expect(panel).toHaveTextContent('MER-2025-0002, Dr. Amol Shinde, 98230 10002');
    const stages = within(within(panel).getByRole('list', { name: 'Lifecycle' })).getAllByRole(
      'listitem',
    );
    expect(stages.map((stage) => stage.textContent)).toEqual([
      '✓ Customer, done',
      '✓ Documents, done',
      '✓ Verified, done',
      '✓ Onboarded, done',
      'AMC active, not yet',
      'Renewal billed, not yet',
      'Renewed, not yet',
    ]);
    expect(panel).toHaveTextContent('PANAAFCS2222L');
    expect(panel).toHaveTextContent('Assigned toSneha Patil');
    expect(panel).toHaveTextContent('AMC statusExpired');
  });

  it('renews from the panel and shows the new year on the AMC tab', async () => {
    const { user } = renderPanel();
    const panel = await openMerchant(user, 'Sahyadri Clinic, Kothrud');

    await user.click(within(panel).getByRole('button', { name: 'Renew AMC' }));
    const form = within(panel).getByRole('form', { name: 'Renew AMC: Sahyadri Clinic, Kothrud' });
    await user.click(within(form).getByRole('button', { name: 'Create renewal invoice' }));

    expect(within(panel).getByRole('tab', { name: 'AMC' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(within(panel).getByRole('table', { name: 'AMC years' })).toHaveTextContent(
      'AMC-2026-0003Raised 03-10-202623-08-2026 to 22-08-2027₹18,000₹21,240Pending',
    );
    expect(within(panel).getByRole('button', { name: 'Renew AMC' })).toBeDisabled();
  });

  it('puts an outlet on hold, which blocks renewal and quotations', async () => {
    const { user, onNavigate } = renderPanel();
    const panel = await openMerchant(user, 'Konkan Fresh Mart, Panaji');

    await user.click(within(panel).getByRole('button', { name: 'New quotation' }));
    expect(onNavigate).toHaveBeenCalledWith('quotations');

    await user.click(within(panel).getByRole('button', { name: 'Change status' }));
    await user.selectOptions(within(panel).getByLabelText('Merchant status'), 'on-hold');
    await user.click(within(panel).getByRole('button', { name: 'Save status' }));

    expect(within(panel).getByRole('button', { name: 'Renew AMC' })).toBeDisabled();
    expect(within(panel).getByRole('button', { name: 'New quotation' })).toBeDisabled();
    await user.click(within(panel).getByRole('tab', { name: 'Timeline' }));
    expect(
      within(within(panel).getByRole('tabpanel')).getAllByRole('listitem')[0],
    ).toHaveTextContent('Merchant status changed to On hold.');
  });

  it('adds a remark and edits contact details', async () => {
    const { user } = renderPanel();
    const panel = await openMerchant(user, 'Sahyadri Clinic, Kothrud');

    await user.click(within(panel).getByRole('button', { name: 'Add remark' }));
    await user.type(within(panel).getByLabelText('Remark'), 'Wants a call after 4 pm');
    await user.click(within(panel).getByRole('button', { name: 'Save remark' }));
    expect(panel).toHaveTextContent('RemarksWants a call after 4 pm');

    await user.click(within(panel).getByRole('button', { name: 'Edit' }));
    const form = within(panel).getByRole('form', { name: 'Edit merchant details' });
    const mobile = within(form).getByLabelText('Mobile');
    await user.clear(mobile);
    await user.type(mobile, '98230');
    await user.click(within(form).getByRole('button', { name: 'Save details' }));
    expect(within(form).getByRole('alert')).toHaveTextContent('Enter a 10-digit mobile number.');

    await user.type(mobile, '55555');
    await user.click(within(form).getByRole('button', { name: 'Save details' }));
    expect(panel).toHaveTextContent('MER-2025-0002, Dr. Amol Shinde, 98230 55555');
  });

  it('shows the ledger balance', async () => {
    const { user } = renderPanel();
    const panel = await openMerchant(user, 'Vidya Vikas School, Baner');

    await user.click(within(panel).getByRole('tab', { name: 'Ledger' }));
    expect(within(panel).getByRole('table', { name: 'Ledger' })).toHaveTextContent(
      'Balance due₹80,240₹49,560₹30,680',
    );
  });
});
