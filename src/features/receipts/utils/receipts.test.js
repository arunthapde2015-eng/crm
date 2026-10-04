import { INITIAL_RECEIPTS, INVOICES, RECEIPT_STATUSES } from '../constants';
import {
  createReceipt,
  filterReceipts,
  findInvoice,
  getEmptyFormValues,
  getInvoiceBalance,
  getListSummary,
  getNextReceiptNumber,
  getOpenInvoices,
  getWhatsAppUrl,
  validateReceipt,
  voidReceipt,
} from './receipts';

const invoice = (number) => findInvoice(INVOICES, number);

describe('receipt figures', () => {
  it('counts every receipt and totals what was collected', () => {
    expect(getListSummary(INITIAL_RECEIPTS)).toEqual({ count: 13, collected: 574610 });
  });

  it('lists newest first, regardless of number order', () => {
    const numbers = filterReceipts(INITIAL_RECEIPTS, INVOICES, { query: '', status: 'all' }).map(
      (receipt) => receipt.number,
    );
    expect(numbers.slice(0, 6)).toEqual([
      'REC-2026-0007',
      'REC-2026-0006',
      'REC-2026-0005',
      'REC-2026-0003',
      'REC-2026-0004',
      'REC-2026-0008',
    ]);
    expect(numbers.at(-1)).toBe('REC-2024-0011');
  });

  it('finds receipts by customer, invoice or UTR', () => {
    const search = (query) =>
      filterReceipts(INITIAL_RECEIPTS, INVOICES, { query, status: 'all' }).map((r) => r.number);
    expect(search('shreeji')).toEqual(['REC-2026-0006']);
    expect(search('UTR658709677')).toEqual(['REC-2026-0003']);
    expect(search('INV-2026-0002')).toEqual(['REC-2026-0003', 'REC-2026-0002']);
  });

  it('works out invoice balances from cleared receipts', () => {
    expect(getInvoiceBalance(invoice('INV-2026-0002'), INITIAL_RECEIPTS)).toBe(5900);
    expect(
      getOpenInvoices(INVOICES, INITIAL_RECEIPTS).map((item) => [item.number, item.balance]),
    ).toEqual([
      ['AMC-2026-0002', 30680],
      ['INV-2026-0002', 5900],
      ['INV-2026-0004', 24376],
      ['INV-2026-0005', 44045],
      ['INV-2026-0006', 63720],
      ['INV-2026-0007', 27200],
    ]);
  });
});

describe('numbering', () => {
  it('numbers by Indian financial year', () => {
    expect(getNextReceiptNumber(INITIAL_RECEIPTS, '2026-10-03')).toBe('REC-2026-0009');
    expect(getNextReceiptNumber(INITIAL_RECEIPTS, '2026-03-20')).toBe('REC-2025-0005');
  });
});

describe('recording and voiding', () => {
  const today = new Date(2026, 9, 3);

  it('rejects overpayment, missing references and reused references', () => {
    const values = {
      ...getEmptyFormValues(today, 'INV-2026-0007'),
      amount: '27201',
      reference: 'UTR294034404',
    };
    expect(validateReceipt(values, INVOICES, INITIAL_RECEIPTS)).toEqual([
      'Amount is more than the invoice balance of ₹27,200.',
      'Reference UTR294034404 is already used on REC-2026-0007.',
    ]);
    expect(
      validateReceipt({ ...values, amount: '100', reference: '' }, INVOICES, INITIAL_RECEIPTS),
    ).toEqual(['Enter the UTR, transaction ID or cheque number.']);
    expect(
      validateReceipt(
        { ...values, amount: '100', reference: '', mode: 'Cash' },
        INVOICES,
        INITIAL_RECEIPTS,
      ),
    ).toEqual([]);
  });

  it('restores the invoice balance when a receipt bounces', () => {
    const bounced = INITIAL_RECEIPTS.map((receipt) =>
      receipt.number === 'REC-2026-0006'
        ? voidReceipt(receipt, RECEIPT_STATUSES.BOUNCED, ' Cheque returned ', '2026-08-26')
        : receipt,
    );
    expect(getInvoiceBalance(invoice('INV-2026-0005'), bounced)).toBe(74045);
    expect(getListSummary(bounced)).toEqual({ count: 13, collected: 544610 });
    expect(bounced.find((receipt) => receipt.number === 'REC-2026-0006').voidReason).toBe(
      'Cheque returned',
    );
  });

  it('creates a numbered receipt and shares it', () => {
    const created = createReceipt(
      { ...getEmptyFormValues(today, 'INV-2026-0006'), amount: '63720', reference: ' UTR1 ' },
      INITIAL_RECEIPTS,
    );
    expect(created).toMatchObject({ number: 'REC-2026-0009', amount: 63720, reference: 'UTR1' });
    expect(decodeURIComponent(getWhatsAppUrl(created, invoice('INV-2026-0006')))).toContain(
      'We have received ₹63,720 on 03-Oct-2026 by NEFT (ref. UTR1) against invoice INV-2026-0006',
    );
  });
});
