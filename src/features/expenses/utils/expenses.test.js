import { EXPENSE_STATUSES, INITIAL_EXPENSES } from '../constants';
import {
  createExpense,
  filterExpenses,
  getEmptyFormValues,
  getGstAmount,
  getListSummary,
  rejectExpense,
  validateExpense,
} from './expenses';

const TODAY = new Date(2026, 9, 3);
const TODAY_ISO = '2026-10-03';
const ALL = { query: '', status: 'all' };

describe('expense list', () => {
  it('totals spend before GST', () => {
    expect(getListSummary(INITIAL_EXPENSES)).toEqual({ count: 11, total: 342100, pendingCount: 0 });
  });

  it('lists newest first and finds by vendor or reference', () => {
    const numbers = (query) =>
      filterExpenses(INITIAL_EXPENSES, { ...ALL, query }).map((e) => e.number);
    expect(numbers('').slice(0, 3)).toEqual(['EXP-2026-0006', 'EXP-2026-0011', 'EXP-2026-0010']);
    expect(numbers('rent2')).toEqual(['EXP-2026-0004']);
    expect(numbers('indigo')).toEqual(['EXP-2026-0010']);
  });

  it('works out GST at each rate', () => {
    expect(getGstAmount(45000, 18)).toBe(8100);
    expect(getGstAmount(9400, 5)).toBe(470);
  });
});

describe('adding expenses', () => {
  const values = { ...getEmptyFormValues(TODAY), vendor: 'Airtel Business', amount: '3500' };

  it('blocks future dates, duplicates and reused references', () => {
    expect(
      validateExpense(
        { ...values, date: '2026-10-04', vendor: ' ', amount: '0' },
        INITIAL_EXPENSES,
        TODAY_ISO,
      ),
    ).toEqual([
      "The expense date can't be in the future.",
      'Enter the vendor.',
      'Enter an amount greater than zero.',
    ]);
    expect(
      validateExpense(
        { ...values, date: '2026-09-21', reference: 'rent0' },
        INITIAL_EXPENSES,
        TODAY_ISO,
      ),
    ).toEqual([
      'This looks like EXP-2026-0011: same vendor, date and amount.',
      'Reference rent0 is already used on EXP-2026-0006.',
    ]);
    expect(validateExpense(values, INITIAL_EXPENSES, TODAY_ISO)).toEqual([]);
  });

  it('numbers the expense and waits for approval', () => {
    const created = createExpense(
      { ...values, category: 'Electricity', description: ' ' },
      INITIAL_EXPENSES,
      'Anita Deshpande',
    );
    expect(created).toMatchObject({
      number: 'EXP-2026-0012',
      description: 'Electricity',
      amount: 3500,
      gstRate: 18,
      status: EXPENSE_STATUSES.PENDING,
      approvedBy: '',
    });
  });

  it('keeps rejected expenses but leaves them out of the total', () => {
    const rejected = INITIAL_EXPENSES.map((expense) =>
      expense.number === 'EXP-2026-0009'
        ? rejectExpense(expense, 'Anita Deshpande', ' Duplicate bill ')
        : expense,
    );
    expect(getListSummary(rejected)).toEqual({ count: 11, total: 307100, pendingCount: 0 });
    expect(rejected.find((expense) => expense.number === 'EXP-2026-0009').rejectReason).toBe(
      'Duplicate bill',
    );
  });
});
