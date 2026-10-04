import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { QuotationsPanel } from './QuotationsPanel';

const TODAY = new Date(2026, 9, 1);

function renderPanel(today = TODAY) {
  const user = userEvent.setup();
  render(<QuotationsPanel today={today} />);
  return { user };
}

function getRow(number) {
  return screen.getByRole('rowheader', { name: new RegExp(`^${number}`) }).closest('tr');
}

async function openQuotation(user, number) {
  await user.click(screen.getByRole('button', { name: number }));
  return screen.getByRole('dialog', { name: new RegExp(`^Quotation ${number}`) });
}

describe('QuotationsPanel list', () => {
  it('lists quotations newest first with the screenshot totals', () => {
    renderPanel();

    expect(screen.getByText('8 documents, ₹5,75,950 in total.')).toBeInTheDocument();
    const numbers = screen.getAllByRole('rowheader').map((cell) => cell.textContent);
    expect(numbers.slice(0, 3)).toEqual([
      'QTN-2026-0007rev. 2',
      'QTN-2026-0008rev. 2',
      'QTN-2026-0006',
    ]);
    expect(getRow('QTN-2026-0001')).toHaveTextContent('₹87,750₹1,03,545Awaiting approval');
    expect(
      within(getRow('QTN-2026-0007')).getByRole('button', { name: 'Edit QTN-2026-0007' }),
    ).toBeDisabled();
  });

  it('filters by status, including expired quotations', async () => {
    const { user } = renderPanel(new Date(2026, 9, 5));

    await user.selectOptions(screen.getByLabelText('Status'), 'Expired');

    expect(screen.getAllByRole('rowheader')).toHaveLength(1);
    expect(getRow('QTN-2026-0002')).toHaveTextContent('Expired');
    expect(screen.getByText('1 document, ₹79,760 in total.')).toBeInTheDocument();
  });
});

describe('QuotationsPanel workflow', () => {
  it('approves a large discount, then sends the quotation', async () => {
    const { user } = renderPanel();
    const panel = await openQuotation(user, 'QTN-2026-0001');

    expect(within(panel).getByRole('button', { name: 'Send to customer' })).toBeDisabled();
    expect(panel).toHaveTextContent('need approval before sending');
    expect(panel).toHaveTextContent('Discount (10%)');

    await user.click(within(panel).getByRole('button', { name: 'Approve discount' }));
    await user.click(within(panel).getByRole('button', { name: 'Send to customer' }));

    expect(within(panel).getByRole('button', { name: 'Mark accepted' })).toBeInTheDocument();
    expect(getRow('QTN-2026-0001')).toHaveTextContent('ApprovedRohan KulkarniSent');
  });

  it('converts an accepted quotation and locks it from editing', async () => {
    const { user } = renderPanel();
    const panel = await openQuotation(user, 'QTN-2026-0006');

    await user.click(within(panel).getByRole('button', { name: 'Convert to order' }));

    expect(within(panel).queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(getRow('QTN-2026-0006')).toHaveTextContent('Converted');
  });

  it('revises a shared quotation as a new revision back in draft', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Edit QTN-2026-0006' }));
    const form = screen.getByRole('form', { name: 'Edit QTN-2026-0006' });
    expect(form).toHaveTextContent('Saving creates rev. 2');
    await user.click(within(form).getByRole('button', { name: 'Save as rev. 2' }));

    expect(getRow('QTN-2026-0006')).toHaveTextContent('rev. 2');
    expect(getRow('QTN-2026-0006')).toHaveTextContent('Draft');
  });

  it('duplicates into a new draft and opens it', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Duplicate QTN-2026-0007' }));

    const panel = screen.getByRole('dialog', { name: /^Quotation QTN-2026-0009/ });
    expect(panel).toHaveTextContent('SWARJY URBAN CO OP CREDIT SOCIETY LI PATHRI');
    expect(screen.getByText('9 documents, ₹6,34,950 in total.')).toBeInTheDocument();
  });

  it('creates a multi-line quotation that needs approval', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'New quotation' }));
    const form = screen.getByRole('form', { name: 'New quotation' });
    await user.type(within(form).getByLabelText('Customer / merchant'), 'Acme Traders');
    await user.type(within(form).getByLabelText('Item 1'), 'Smart POS terminal');
    await user.type(within(form).getByLabelText('Unit price (₹), item 1'), '20000');
    await user.click(within(form).getByRole('button', { name: 'Add line' }));
    await user.type(within(form).getByLabelText('Item 2'), 'Installation');
    await user.type(within(form).getByLabelText('Unit price (₹), item 2'), '5000');
    await user.clear(within(form).getByLabelText('Discount (%)'));
    await user.type(within(form).getByLabelText('Discount (%)'), '12');

    expect(form).toHaveTextContent('Taxable₹22,000');
    expect(form).toHaveTextContent('needs approval before this can be sent');
    await user.click(within(form).getByRole('button', { name: 'Save draft' }));

    expect(getRow('QTN-2026-0009')).toHaveTextContent('Acme Traders');
    expect(getRow('QTN-2026-0009')).toHaveTextContent('Awaiting approval');
  });
});

describe('Quotation document', () => {
  it('lays out the proposal like the printed format', async () => {
    const { user } = renderPanel();
    await openQuotation(user, 'QTN-2026-0007');

    const document = screen.getByRole('article', { name: 'Quotation document QTN-2026-0007' });
    expect(document).toHaveTextContent('Quotation No. QTN-2026-0007 (rev. 2)');
    expect(document).toHaveTextContent('Date: 29-Sep-2026');
    expect(document).toHaveTextContent('Valid until: 14-Oct-2026');
    expect(document).toHaveTextContent('Respected Sir/Madam,');
    expect(document).toHaveTextContent(
      'Please find below our commercial proposal for UPI Autopay and eNach Service CIBIL/Credit Score Verification, Wallet Balance.',
    );
    const table = within(document).getByRole('table', { name: 'Commercial details' });
    expect(table).toHaveTextContent('AutoPay, eNACH, and CIBIL Verification Services.');
    expect(table).toHaveTextContent('₹45,000.00');
    expect(table).toHaveTextContent('CGST ₹4,500.00 + SGST ₹4,500.00₹9,000.00');
    expect(table).toHaveTextContent('Total including GST₹59,000.00');
    expect(document).toHaveTextContent('Amount in words: FIFTY-NINE THOUSAND RUPEES ONLY');
    expect(
      within(document).getByRole('heading', { name: 'Transaction Charges (Exclusive of GST)' }),
    ).toBeInTheDocument();
    expect(within(document).getByText('FREE').tagName).toBe('STRONG');
    expect(document).toHaveTextContent('Arun Thapde');
  });

  it('prints with a descriptive file name and restores the page title', async () => {
    const { user } = renderPanel();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {
      expect(document.title).toBe(
        'Quotation-QTN-2026-0007-SWARJY-URBAN-CO-OP-CREDIT-SOCIETY-LI-PAT',
      );
    });
    const originalTitle = document.title;
    const panel = await openQuotation(user, 'QTN-2026-0007');

    await user.click(within(panel).getByRole('button', { name: 'Print / PDF' }));

    expect(printSpy).toHaveBeenCalledTimes(1);
    expect(document.title).toBe(originalTitle);
    printSpy.mockRestore();
  });

  it('switches to IGST when the place of supply is another state', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Edit QTN-2026-0001' }));
    const form = screen.getByRole('form', { name: 'Edit QTN-2026-0001' });
    await user.selectOptions(within(form).getByLabelText('Place of supply'), 'Goa');
    await user.click(within(form).getByRole('button', { name: 'Save changes' }));
    await openQuotation(user, 'QTN-2026-0001');

    const table = screen.getByRole('table', { name: 'Commercial details' });
    expect(table).toHaveTextContent('IGST ₹15,795.00');
  });
});
