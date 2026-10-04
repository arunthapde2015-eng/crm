import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NAV_IDS } from '@/constants/navigation';

import { AccountingWorkspace } from './AccountingWorkspace';

const TODAY = new Date(2026, 9, 3);

function renderView(view) {
  const user = userEvent.setup();
  const result = render(<AccountingWorkspace view={view} today={TODAY} />);
  const showView = (nextView) =>
    result.rerender(<AccountingWorkspace view={nextView} today={TODAY} />);
  return { user, showView };
}

async function fillLine(user, form, lineNumber, { account, debit, credit }) {
  await user.selectOptions(within(form).getByLabelText(`Line ${lineNumber} account`), account);
  if (debit) await user.type(within(form).getByLabelText(`Line ${lineNumber} debit (₹)`), debit);
  if (credit) {
    await user.type(within(form).getByLabelText(`Line ${lineNumber} credit (₹)`), credit);
  }
}

describe('Vouchers', () => {
  it('lists vouchers newest first', () => {
    renderView(NAV_IDS.VOUCHERS);

    expect(screen.getByText('22 vouchers, ₹13,22,136 posted.')).toBeInTheDocument();
    expect(screen.getAllByRole('rowheader')[0]).toHaveTextContent('JV-2026-0001');
  });

  it('posts a balanced voucher, which then shows in the bank book', async () => {
    const { user, showView } = renderView(NAV_IDS.VOUCHERS);

    await user.click(screen.getByRole('button', { name: 'New voucher' }));
    const form = screen.getByRole('form', { name: 'New voucher' });
    await user.type(within(form).getByLabelText('Narration'), 'HDFC account charges');
    await fillLine(user, form, 1, { account: '5170', debit: '590' });
    await fillLine(user, form, 2, { account: '1010', credit: '500' });
    expect(form).toHaveTextContent('Debits ₹590, credits ₹500, difference ₹90');
    await user.click(within(form).getByRole('button', { name: 'Post voucher' }));
    expect(within(form).getByRole('alert')).toHaveTextContent(
      "Debits ₹590 and credits ₹500 don't match.",
    );

    await user.type(
      within(form).getByLabelText('Line 2 credit (₹)'),
      '{backspace}{backspace}{backspace}590',
    );
    await user.click(within(form).getByRole('button', { name: 'Post voucher' }));
    const drawer = screen.getByRole('dialog', { name: 'Payment voucher PV-2026-0013' });
    expect(drawer).toHaveTextContent('HDFC account charges');
    await user.click(within(drawer).getByRole('button', { name: 'Close voucher' }));

    showView(NAV_IDS.BANK_BOOK);
    expect(screen.getByText('₹1,69,034 in bank and cash today.')).toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: 'Bank book: HDFC Bank current account' }),
    ).toHaveTextContent('PV-2026-0013Bank chargesHDFC account charges₹590₹75,480 Dr');
  });

  it('cancels a voucher with a reason, leaving it out of balances', async () => {
    const { user, showView } = renderView(NAV_IDS.VOUCHERS);

    await user.click(screen.getByRole('button', { name: 'CV-2026-0001' }));
    const drawer = screen.getByRole('dialog', { name: 'Contra voucher CV-2026-0001' });
    await user.click(within(drawer).getByRole('button', { name: 'Cancel voucher' }));
    const cancelForm = within(drawer).getByRole('form', { name: 'Cancel this voucher?' });
    await user.type(within(cancelForm).getByLabelText('Reason'), 'Withdrawal bounced');
    await user.click(within(cancelForm).getByRole('button', { name: 'Cancel voucher' }));
    expect(drawer).toHaveTextContent('Cancelled: Withdrawal bounced');

    showView(NAV_IDS.LEDGERS);
    await user.selectOptions(screen.getByLabelText('Account'), '1030');
    expect(screen.getByText('Cash in hand: closing balance ₹7,684 Dr.')).toBeInTheDocument();
  });
});

describe('Reports', () => {
  it('shows a trial balance that agrees, and the profit or loss', async () => {
    const { user } = renderView(NAV_IDS.TRIAL_BALANCE);

    expect(screen.getByRole('table', { name: 'Trial balance' })).toHaveTextContent(
      'Total₹9,74,000₹9,74,000',
    );
    await user.click(screen.getByRole('tab', { name: 'Profit & loss' }));
    expect(screen.getByText('Net loss ₹3,60,100')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Balance sheet' }));
    expect(screen.getByRole('region', { name: 'Assets' })).toHaveTextContent(
      'Total assets₹3,67,900',
    );
    expect(screen.getByRole('region', { name: 'Capital' })).toHaveTextContent(
      'Loss for the yearFrom the profit & loss account-₹3,60,100',
    );
    expect(
      screen.getByText('Assets ₹3,67,900 = liabilities and capital ₹3,67,900'),
    ).toBeInTheDocument();
  });

  it('filters the expense GL by account', async () => {
    const { user } = renderView(NAV_IDS.EXPENSE_GL);

    expect(
      screen.getByText('₹6,06,100 expenses from 01-04-2026 to 03-10-2026.'),
    ).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Account'), '5100');
    expect(
      screen.getByText('₹2,70,000 expenses from 01-04-2026 to 03-10-2026.'),
    ).toBeInTheDocument();
  });

  it('narrows the income GL to a period', async () => {
    const { user } = renderView(NAV_IDS.INCOME_GL);

    const from = screen.getByLabelText('From');
    await user.clear(from);
    await user.type(from, '2026-07-01');
    expect(screen.getByText('₹1,50,000 income from 01-07-2026 to 03-10-2026.')).toBeInTheDocument();
  });
});

describe('Manage banks', () => {
  it('adds a bank that vouchers and the bank book can use', async () => {
    const { user, showView } = renderView(NAV_IDS.BANKS);

    expect(
      screen.getByText('2 active bank accounts, ₹1,41,940 in bank today.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close HDFC Bank current account' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Add bank account' }));
    const form = screen.getByRole('form', { name: 'Add bank account' });
    await user.type(within(form).getByLabelText('Account name'), 'ICICI current account');
    await user.type(within(form).getByLabelText('Bank'), 'ICICI Bank');
    await user.type(within(form).getByLabelText('Account number'), '000405012345');
    await user.type(within(form).getByLabelText('IFSC'), 'icic0000004');
    await user.click(within(form).getByRole('button', { name: 'Save bank account' }));

    const row = screen.getByRole('rowheader', { name: /^ICICI current account/ }).closest('tr');
    expect(row).toHaveTextContent(
      'ICICI current account1040, CurrentICICI BankXXXX2345ICIC0000004',
    );
    await user.click(within(row).getByRole('button', { name: 'Close ICICI current account' }));
    expect(row).toHaveTextContent('Closed');

    showView(NAV_IDS.BANK_BOOK);
    expect(
      within(screen.getByRole('region', { name: 'Bank and cash balances' })).getByText(
        'ICICI current account (closed)',
      ),
    ).toBeInTheDocument();
  });
});
