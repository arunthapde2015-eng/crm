import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PurchasesPanel } from './PurchasesPanel';

const TODAY = new Date(2026, 9, 3);

function renderPanel() {
  const user = userEvent.setup();
  render(<PurchasesPanel today={TODAY} />);
  return { user };
}

function getRow(name) {
  return screen.getByRole('rowheader', { name: new RegExp(`^${name}`) }).closest('tr');
}

describe('PurchasesPanel', () => {
  it('shows what is payable and each bill', () => {
    renderPanel();

    expect(screen.getByText('₹63,720 payable to vendors.')).toBeInTheDocument();
    expect(getRow('PUR-2026-0002')).toHaveTextContent(
      'PUR-2026-0002Bill ADPL/2026/40212-09-2026Axis Devices Pvt. Ltd.Smart POS terminals, 6 nos₹54,000₹9,720₹63,720Unpaid',
    );
    expect(getRow('PUR-2026-0001')).toHaveTextContent('₹1,06,200Paid19-07-2026');
    expect(
      within(getRow('PUR-2026-0001')).queryByRole('button', { name: /Pay vendor/ }),
    ).not.toBeInTheDocument();
  });

  it('pays a vendor', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Pay vendor for PUR-2026-0002' }));
    const form = screen.getByRole('form', { name: 'Pay Axis Devices Pvt. Ltd. for PUR-2026-0002' });
    expect(form).toHaveTextContent('Paying the full ₹63,720.');
    await user.click(within(form).getByRole('button', { name: 'Save payment' }));
    expect(within(form).getByRole('alert')).toHaveTextContent(
      'Enter the UTR, transaction ID or cheque number.',
    );

    await user.type(within(form).getByLabelText('UTR / transaction / cheque no.'), 'UTR031026402');
    await user.click(within(form).getByRole('button', { name: 'Save payment' }));

    expect(screen.getByText('₹0 payable to vendors.')).toBeInTheDocument();
    expect(getRow('PUR-2026-0002')).toHaveTextContent('Paid03-10-2026');
  });

  it('adds a purchase bill', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Add purchase bill' }));
    const form = screen.getByRole('form', { name: 'Add purchase bill' });
    await user.selectOptions(within(form).getByLabelText('Vendor'), 'matrix-rolls');
    await user.type(within(form).getByLabelText('Vendor bill no.'), 'MPR/118');
    await user.type(within(form).getByLabelText('Description'), 'Thermal paper rolls, 500 nos');
    await user.type(within(form).getByLabelText('Amount (₹, before GST)'), '6000');
    await user.selectOptions(within(form).getByLabelText('GST rate'), '12');
    expect(form).toHaveTextContent('GST ₹720, bill total ₹6,720');
    await user.click(within(form).getByRole('button', { name: 'Save bill' }));

    expect(getRow('PUR-2026-0003')).toHaveTextContent('Matrix Paper Rolls');
    expect(screen.getByText('₹70,440 payable to vendors.')).toBeInTheDocument();
  });

  it('adds a vendor and shows it on the Vendors tab', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Add vendor' }));
    const form = screen.getByRole('form', { name: 'Add vendor' });
    await user.type(within(form).getByLabelText('Vendor name'), 'Shree Ganesh Electronics');
    await user.type(within(form).getByLabelText('Mobile'), '9823020003');
    await user.click(within(form).getByRole('button', { name: 'Save vendor' }));

    expect(screen.getByRole('tab', { name: 'Vendors' })).toHaveAttribute('aria-selected', 'true');
    expect(getRow('Shree Ganesh Electronics')).toHaveTextContent(
      'Shree Ganesh ElectronicsNo GSTIN—98230 20003Maharashtra0₹0₹0',
    );
  });
});
