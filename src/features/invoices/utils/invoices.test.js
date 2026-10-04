import { getGstSplit, getTotal } from '@/utils/lineItems';

import {
  INITIAL_INVOICES,
  INVOICE_KINDS,
  INVOICE_STATUSES,
  KIND_FILTERS,
  NOTE_TYPES,
} from '../constants';
import {
  createInvoice,
  createNote,
  duplicateInvoice,
  filterInvoices,
  getBalance,
  getCancelBlocker,
  getDisplayStatus,
  getEmptyFormValues,
  getIncentiveNote,
  getListSummary,
  getNoteError,
  getPaymentError,
  updateDraft,
} from './invoices';

const TODAY = '2026-10-03';
const byNumber = (number) => INITIAL_INVOICES.find((invoice) => invoice.number === number);

describe('invoice list figures', () => {
  it('matches the billed and outstanding totals', () => {
    expect(getListSummary(INITIAL_INVOICES)).toEqual({
      count: 11,
      billed: 782331,
      outstanding: 184121,
    });
  });

  it('works out balances, mixed GST and IGST', () => {
    const konkan = byNumber('INV-2026-0004');
    expect(getTotal(konkan)).toBe(64376);
    expect(getBalance(konkan)).toBe(24376);
    expect(getGstSplit(konkan)).toEqual({ cgst: 0, sgst: 0, igst: 9576 });
    expect(getBalance(byNumber('INV-2026-0008'))).toBe(0);
  });

  it('derives statuses from payments and the due date', () => {
    const statusOf = (number, today = TODAY) => getDisplayStatus(byNumber(number), today);
    expect(statusOf('AMC-2026-0002')).toBe(INVOICE_STATUSES.ISSUED);
    expect(statusOf('INV-2026-0009')).toBe(INVOICE_STATUSES.CANCELLED);
    expect(statusOf('INV-2026-0008')).toBe(INVOICE_STATUSES.DRAFT);
    expect(statusOf('INV-2026-0007')).toBe(INVOICE_STATUSES.PARTIALLY_PAID);
    expect(statusOf('INV-2026-0007', '2026-10-05')).toBe(INVOICE_STATUSES.OVERDUE);
    expect(statusOf('INV-2026-0006')).toBe(INVOICE_STATUSES.OVERDUE);
    expect(statusOf('INV-2026-0001')).toBe(INVOICE_STATUSES.PAID);
  });

  it('filters by kind and status, newest first', () => {
    const amc = filterInvoices(
      INITIAL_INVOICES,
      { query: '', status: 'all', kind: KIND_FILTERS.AMC },
      TODAY,
    );
    expect(amc.map((invoice) => invoice.number)).toEqual(['AMC-2026-0002', 'AMC-2026-0001']);
    const overdue = filterInvoices(
      INITIAL_INVOICES,
      { query: '', status: INVOICE_STATUSES.OVERDUE, kind: KIND_FILTERS.ALL },
      TODAY,
    );
    expect(overdue.map((invoice) => invoice.number)).toEqual([
      'INV-2026-0006',
      'INV-2026-0005',
      'INV-2026-0004',
    ]);
  });
});

describe('rules', () => {
  it('limits payments to the balance', () => {
    const nirmal = byNumber('INV-2026-0007');
    expect(getPaymentError(nirmal, 27201)).toMatch(/more than the balance of ₹27,200/);
    expect(getPaymentError(nirmal, 27200)).toBeNull();
    expect(getPaymentError(byNumber('INV-2026-0008'), 100)).toMatch(/nothing to collect/);
  });

  it('only cancels invoices without payments', () => {
    expect(getCancelBlocker(byNumber('AMC-2026-0002'))).toBeNull();
    expect(getCancelBlocker(byNumber('INV-2026-0007'))).toMatch(/credit note/);
  });

  it('adjusts the balance with credit and debit notes', () => {
    const shreeji = byNumber('INV-2026-0005');
    const credit = createNote(
      { type: NOTE_TYPES.CREDIT, date: '2026-10-03', amount: '5000', reason: 'Discount agreed' },
      INITIAL_INVOICES,
    );
    expect(credit.number).toBe('CN-2026-0001');
    expect(getBalance({ ...shreeji, notes: [credit] })).toBe(33145);
    expect(getNoteError(shreeji, NOTE_TYPES.CREDIT, 74046)).toMatch(/can’t exceed ₹74,045/);
  });

  it('explains incentives for AMC and sales invoices', () => {
    expect(getIncentiveNote(byNumber('AMC-2026-0002'), 'Rohan Kulkarni')).toMatch(/^No incentive/);
    expect(getIncentiveNote(byNumber('INV-2026-0007'), 'Rohan Kulkarni')).toMatch(
      /Rohan Kulkarni’s incentive/,
    );
  });
});

describe('creating', () => {
  it('numbers sales and AMC invoices in separate series', () => {
    const values = getEmptyFormValues(new Date(2026, 9, 3));
    expect(createInvoice(values, INITIAL_INVOICES, false)).toMatchObject({
      number: 'INV-2026-0010',
      status: INVOICE_STATUSES.DRAFT,
      dueDate: '2026-10-18',
    });
    expect(
      createInvoice({ ...values, kind: INVOICE_KINDS.AMC }, INITIAL_INVOICES, true),
    ).toMatchObject({ number: 'AMC-2026-0003', status: INVOICE_STATUSES.ISSUED });
  });

  it('moves a draft to the other series when its kind changes', () => {
    const draft = byNumber('INV-2026-0008');
    const values = { ...getEmptyFormValues(new Date(2026, 8, 27)), kind: INVOICE_KINDS.AMC };
    expect(updateDraft(draft, values, INITIAL_INVOICES).number).toBe('AMC-2026-0003');
  });

  it('duplicates as a fresh draft', () => {
    const copy = duplicateInvoice(
      byNumber('INV-2026-0006'),
      INITIAL_INVOICES,
      new Date(2026, 9, 3),
    );
    expect(copy).toMatchObject({ number: 'INV-2026-0010', status: INVOICE_STATUSES.DRAFT });
    expect(copy.payments).toEqual([]);
  });
});
