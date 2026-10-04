import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NAV_IDS } from '@/constants/navigation';

import { ProformasPanel } from './ProformasPanel';

const TODAY = new Date(2026, 8, 30);

function renderPanel() {
  const user = userEvent.setup();
  const onNavigate = vi.fn();
  render(<ProformasPanel onNavigate={onNavigate} today={TODAY} />);
  return { user, onNavigate };
}

function getRow(number) {
  return screen.getByRole('rowheader', { name: new RegExp(`^${number}`) }).closest('tr');
}

async function openProforma(user, number) {
  await user.click(screen.getByRole('button', { name: number }));
  return screen.getByRole('dialog', { name: new RegExp(`^Proforma invoice ${number}`) });
}

describe('ProformasPanel list', () => {
  it('lists proformas newest first with the screenshot totals', () => {
    renderPanel();

    expect(screen.getByText('5 documents, ₹2,61,995 in total.')).toBeInTheDocument();
    const numbers = screen.getAllByRole('rowheader').map((cell) => cell.textContent);
    expect(numbers).toEqual([
      'PI-2026-0004',
      'PI-2026-0005rev. 2',
      'PI-2026-0003',
      'PI-2026-0002',
      'PI-2026-0001',
    ]);
    expect(getRow('PI-2026-0004')).toHaveTextContent('₹37,500₹37,500Rohan KulkarniIssued');
    expect(getRow('PI-2026-0001')).toHaveTextContent('Converted');
  });

  it('opens the print dialog straight from a row’s PDF link', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'PDF of PI-2026-0004' }));

    await vi.waitFor(() => expect(printSpy).toHaveBeenCalledTimes(1));
    expect(
      screen.getByRole('dialog', { name: /^Proforma invoice PI-2026-0004/ }),
    ).toBeInTheDocument();
    printSpy.mockRestore();
  });
});

describe('Proforma document', () => {
  it('lays out the customer, document details and lines like the printed format', async () => {
    const { user } = renderPanel();
    const panel = await openProforma(user, 'PI-2026-0004');

    expect(panel).toHaveTextContent(
      'Mauli Nagri Sahakari Patsanstha Marya Majalgaon, prepared by Rohan Kulkarni, from quotation QTN-2026-0006',
    );
    const document = within(panel).getByRole('article', { name: 'Proforma document PI-2026-0004' });
    expect(document).toHaveTextContent('FINSOLIS SOFTWARE SOLUTIONS PRIVATE LIMITED');
    expect(document).toHaveTextContent('Ho No 10 Rayyan Colony Pathri');
    expect(document).toHaveTextContent('PANAAEAM3823E');
    expect(document).toHaveTextContent('Place of SupplyMaharashtra ( 27 )');
    expect(document).toHaveTextContent('Proforma Date29-Sep-2026');
    expect(document).toHaveTextContent('Valid Till06-Oct-2026');
    expect(document).toHaveTextContent('Quotation Ref.QTN-2026-0006');

    const lines = within(document).getByRole('table', { name: 'Products and services' });
    expect(lines).toHaveTextContent('AutoPay, eNACH, and CIBIL Verification Services.');
    expect(lines).toHaveTextContent('1.0032,500.0032,500.00');
    expect(within(document).getByRole('table', { name: 'Totals' })).toHaveTextContent(
      'Total Amount₹37,500.00',
    );
    expect(document).toHaveTextContent('THIRTY-SEVEN THOUSAND FIVE HUNDRED RUPEES ONLY');
    expect(document).toHaveTextContent('Authorised Signatory');
  });

  it('links back to the quotation and offers WhatsApp and email', async () => {
    const { user, onNavigate } = renderPanel();
    const panel = await openProforma(user, 'PI-2026-0004');

    expect(within(panel).getByRole('link', { name: 'Share on WhatsApp' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^https:\/\/wa\.me\/919689814242\?text=/),
    );
    expect(within(panel).getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:/),
    );
    await user.click(within(panel).getByRole('button', { name: 'QTN-2026-0006' }));
    expect(onNavigate).toHaveBeenCalledWith(NAV_IDS.QUOTATIONS);
  });
});

describe('Proforma actions', () => {
  it('converts an issued proforma to an invoice', async () => {
    const { user } = renderPanel();
    const panel = await openProforma(user, 'PI-2026-0003');

    await user.click(within(panel).getByRole('button', { name: 'Convert to invoice' }));

    expect(within(panel).queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(getRow('PI-2026-0003')).toHaveTextContent('Converted');
  });

  it('cancels only after confirmation and keeps the record', async () => {
    const { user } = renderPanel();
    const panel = await openProforma(user, 'PI-2026-0002');

    await user.click(within(panel).getByRole('button', { name: 'Cancel' }));
    expect(within(panel).getByRole('alert')).toHaveTextContent('stays on record as cancelled');
    await user.click(within(panel).getByRole('button', { name: 'Yes, cancel it' }));

    expect(getRow('PI-2026-0002')).toHaveTextContent('Cancelled');
    expect(screen.getByText('5 documents, ₹2,61,995 in total.')).toBeInTheDocument();
  });

  it('re-issues an edit as a new revision', async () => {
    const { user } = renderPanel();
    const panel = await openProforma(user, 'PI-2026-0002');

    await user.click(within(panel).getByRole('button', { name: 'Edit' }));
    const form = screen.getByRole('form', { name: 'Edit PI-2026-0002' });
    await user.selectOptions(within(form).getByLabelText('Place of supply'), 'Goa');
    await user.click(within(form).getByRole('button', { name: 'Re-issue as rev. 2' }));

    expect(getRow('PI-2026-0002')).toHaveTextContent('rev. 2');
    const reopened = await openProforma(user, 'PI-2026-0002');
    expect(within(reopened).getByRole('table', { name: 'Totals' })).toHaveTextContent(
      'IGST12,825.00',
    );
  });

  it('issues a new proforma with HSN codes', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'New proforma' }));
    const form = screen.getByRole('form', { name: 'New proforma' });
    await user.type(within(form).getByLabelText('Customer / merchant (M/S)'), 'Acme Traders');
    await user.type(within(form).getByLabelText('Item 1'), 'Smart POS terminal');
    await user.type(within(form).getByLabelText('Unit price (₹), item 1'), '10000');
    await user.type(within(form).getByLabelText('HSN / SAC, item 1'), '8470');
    expect(form).toHaveTextContent('Taxable ₹10,000 + GST ₹1,800 = ₹11,800');
    await user.click(within(form).getByRole('button', { name: 'Issue proforma' }));

    expect(getRow('PI-2026-0006')).toHaveTextContent('Acme Traders');
    expect(getRow('PI-2026-0006')).toHaveTextContent('Issued');
  });
});
