import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExpensesPanel } from './ExpensesPanel';

const TODAY = new Date(2026, 9, 3);

function renderPanel() {
  const user = userEvent.setup();
  render(<ExpensesPanel today={TODAY} />);
  return { user };
}

function getRow(number) {
  return screen.getByRole('rowheader', { name: number }).closest('tr');
}

async function addExpense(user, { vendor, amount, gstRate = '18' }) {
  await user.click(screen.getByRole('button', { name: 'Add expense' }));
  const form = screen.getByRole('form', { name: 'Add expense' });
  await user.selectOptions(within(form).getByLabelText('Category'), 'Electricity');
  await user.type(within(form).getByLabelText('Vendor'), vendor);
  await user.type(within(form).getByLabelText('Amount (₹, before GST)'), amount);
  await user.selectOptions(within(form).getByLabelText('GST rate'), gstRate);
  return form;
}

describe('ExpensesPanel', () => {
  it('lists expenses with mode reference and GST', () => {
    renderPanel();

    expect(screen.getByText('11 expenses, ₹3,42,100 before GST.')).toBeInTheDocument();
    expect(getRow('EXP-2026-0006')).toHaveTextContent(
      'EXP-2026-000625-09-2026Office rentPune Office Spaces LLPMonthly office rentNEFTRENT0Anita Deshpande₹45,000₹8,100',
    );
    expect(getRow('EXP-2026-0010')).toHaveTextContent('₹9,400₹470');
  });

  it('filters by text', async () => {
    const { user } = renderPanel();

    await user.type(screen.getByLabelText('Filter expenses'), 'office rent');

    expect(screen.getByText('6 expenses, ₹2,70,000 before GST.')).toBeInTheDocument();
  });

  it('adds an expense for approval, then approves it', async () => {
    const { user } = renderPanel();

    const form = await addExpense(user, { vendor: 'MSEDCL', amount: '4200' });
    expect(form).toHaveTextContent('GST ₹756, total paid ₹4,956');
    await user.click(within(form).getByRole('button', { name: 'Save expense' }));

    expect(
      screen.getByText('12 expenses, ₹3,46,300 before GST. 1 waiting for approval.'),
    ).toBeInTheDocument();
    const row = getRow('EXP-2026-0012');
    expect(row).toHaveTextContent('ElectricityMSEDCLElectricityNEFTPending approval');

    await user.click(within(row).getByRole('button', { name: 'Approve EXP-2026-0012' }));
    expect(getRow('EXP-2026-0012')).toHaveTextContent('Anita Deshpande₹4,200₹756');
    expect(screen.getByText('12 expenses, ₹3,46,300 before GST.')).toBeInTheDocument();
  });

  it('rejects with a reason and keeps the expense on record', async () => {
    const { user } = renderPanel();

    const form = await addExpense(user, { vendor: 'MSEDCL', amount: '4200' });
    await user.click(within(form).getByRole('button', { name: 'Save expense' }));
    await user.click(screen.getByRole('button', { name: 'Reject EXP-2026-0012' }));

    const rejectForm = screen.getByRole('form', { name: 'Reject EXP-2026-0012?' });
    expect(within(rejectForm).getByRole('button', { name: 'Reject expense' })).toBeDisabled();
    await user.type(within(rejectForm).getByLabelText('Reason'), 'Personal bill');
    await user.click(within(rejectForm).getByRole('button', { name: 'Reject expense' }));

    expect(getRow('EXP-2026-0012')).toHaveTextContent('RejectedAnita Deshpande: Personal bill');
    expect(screen.getByText('12 expenses, ₹3,42,100 before GST.')).toBeInTheDocument();
  });

  it('refuses a duplicate bill', async () => {
    const { user } = renderPanel();

    const form = await addExpense(user, { vendor: 'Indigo', amount: '9400', gstRate: '5' });
    const date = within(form).getByLabelText('Date');
    await user.clear(date);
    await user.type(date, '2026-09-15');
    await user.click(within(form).getByRole('button', { name: 'Save expense' }));

    expect(within(form).getByRole('alert')).toHaveTextContent(
      'This looks like EXP-2026-0010: same vendor, date and amount.',
    );
  });
});
