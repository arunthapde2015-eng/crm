import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CallDeskPanel } from './CallDeskPanel';

const NOW = new Date(2026, 9, 4, 10, 30);

function renderPanel() {
  const user = userEvent.setup();
  const onNavigate = vi.fn();
  render(<CallDeskPanel onNavigate={onNavigate} now={NOW} />);
  return { user, onNavigate };
}

const getSection = (name) => screen.getByRole('region', { name: new RegExp(`^${name}`) });

describe('CallDeskPanel', () => {
  it('shows the queue in sections', () => {
    renderPanel();

    expect(
      screen.getByText('16 calls waiting. 0 logged by you today, 0 connected.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Call queue (16)' })).toBeInTheDocument();
    const callBacks = getSection('Call-backs due');
    expect(within(callBacks).getAllByRole('row')[1]).toHaveTextContent(
      'Sahyadri Clinic, KothrudMerchant98230 10002Call back requested. Last call: not reachable, 27-09-202628-09-2026',
    );
    expect(
      within(getSection('AMC renewal calls')).getByRole('link', { name: '98230 10001' }),
    ).toHaveAttribute('href', 'tel:+919823010001');
  });

  it('logs a connected call, taking it off the queue', async () => {
    const { user } = renderPanel();

    await user.click(
      screen.getByRole('button', { name: 'Log call to Konkan Fresh Mart, Payment reminders' }),
    );
    const form = screen.getByRole('form', { name: 'Log call: Konkan Fresh Mart' });
    await user.type(within(form).getByLabelText('Notes (optional)'), 'Paying on Monday');
    await user.click(within(form).getByRole('button', { name: 'Save call' }));

    expect(
      screen.getByText('15 calls waiting. 1 logged by you today, 1 connected.'),
    ).toBeInTheDocument();
    expect(within(getSection('Payment reminders')).queryByText('Konkan Fresh Mart')).toBeNull();

    await user.click(screen.getByRole('tab', { name: 'Call log' }));
    expect(screen.getAllByRole('row')[1]).toHaveTextContent(
      '04-10-2026, 10:30Konkan Fresh Mart98230 10004OutgoingConnectedPaying on MondayAnita Deshpande',
    );
  });

  it('moves an unanswered call to call-backs', async () => {
    const { user } = renderPanel();

    await user.click(
      screen.getByRole('button', { name: 'Log call to Metro Fitness Studio, Lead follow-ups' }),
    );
    const form = screen.getByRole('form', { name: 'Log call: Metro Fitness Studio' });
    await user.selectOptions(within(form).getByLabelText('Outcome'), 'busy');
    expect(within(form).getByLabelText('Try again on')).toHaveValue('2026-10-05');
    await user.click(within(form).getByRole('button', { name: 'Save call' }));

    expect(screen.getByRole('heading', { name: 'Call-backs due (3)' })).toBeInTheDocument();
    expect(
      within(getSection('Call-backs due')).getByText('Metro Fitness Studio'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('16 calls waiting. 1 logged by you today, 0 connected.'),
    ).toBeInTheDocument();
  });

  it('records a new enquiry as a lead follow-up', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'New enquiry as lead' }));
    const form = screen.getByRole('form', { name: 'New enquiry as lead' });
    await user.type(within(form).getByLabelText('Business or name'), 'Om Sai Travels');
    await user.type(within(form).getByLabelText('Phone'), '9823010016');
    await user.type(within(form).getByLabelText('Interested in'), 'Payment links');
    await user.type(within(form).getByLabelText('Estimated value (₹, optional)'), '15000');
    await user.click(within(form).getByRole('button', { name: 'Save enquiry' }));

    expect(screen.getByRole('heading', { name: 'Lead follow-ups (10)' })).toBeInTheDocument();
    expect(
      within(getSection('Lead follow-ups')).getByText('Payment links, ₹15,000. Call planned'),
    ).toBeInTheDocument();
  });

  it('opens the contact page and support tickets', async () => {
    const { user, onNavigate } = renderPanel();

    await user.click(
      within(getSection('Payment reminders')).getAllByRole('button', { name: /^Open/ })[0],
    );
    expect(onNavigate).toHaveBeenCalledWith('sales-invoices');
    await user.click(screen.getByRole('button', { name: 'Raise ticket' }));
    expect(onNavigate).toHaveBeenCalledWith('support-tickets');
  });
});
