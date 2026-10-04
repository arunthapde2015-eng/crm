import { AMC_STATUSES, INITIAL_CONTRACTS } from '../constants';
import {
  canRenew,
  createRenewalPeriod,
  filterContracts,
  getDaysRemaining,
  getPeriodEnd,
  getReminderLabel,
  getRenewalFormValues,
  getStatus,
  getSummary,
  validateRenewal,
} from './amc';

const TODAY = '2026-10-03';
const find = (code) => INITIAL_CONTRACTS.find((contract) => contract.merchantCode === code);
const SAHYADRI = find('MER-2025-0002');
const BANER = find('MER-2025-0001');
const KONKAN = find('MER-2025-0003');

describe('contract status', () => {
  it('counts days, reminders and statuses as on the screen', () => {
    const rows = filterContracts(INITIAL_CONTRACTS, TODAY, { query: '', status: 'all' }).map(
      (contract) => [
        contract.merchantCode,
        getDaysRemaining(contract, TODAY),
        getReminderLabel(contract, TODAY),
        getStatus(contract, TODAY),
      ],
    );
    expect(rows).toEqual([
      ['MER-2025-0002', -42, 'Expired 42 days ago', AMC_STATUSES.EXPIRED],
      ['MER-2025-0001', 8, '15-day reminder', AMC_STATUSES.EXPIRING_SOON],
      ['MER-2025-0003', 78, '90-day reminder', AMC_STATUSES.ACTIVE],
      ['MER-2024-0001', 123, '', AMC_STATUSES.ACTIVE],
      ['MER-2026-0001', 238, '', AMC_STATUSES.ACTIVE],
    ]);
  });

  it('sends the expiry-day reminder on the last day', () => {
    expect(getReminderLabel(KONKAN, '2026-12-20')).toBe('Expiry-day reminder');
    expect(getReminderLabel(KONKAN, '2026-12-21')).toBe('Expired 1 day ago');
  });

  it('totals revenue before GST and dues with GST', () => {
    const { counts, billed, dues } = getSummary(INITIAL_CONTRACTS, TODAY);
    expect(counts).toEqual({
      [AMC_STATUSES.ACTIVE]: 3,
      [AMC_STATUSES.EXPIRING_SOON]: 1,
      [AMC_STATUSES.EXPIRED]: 1,
      [AMC_STATUSES.RENEWED]: 0,
      [AMC_STATUSES.PENDING_FIRST_PAYMENT]: 0,
    });
    expect(billed).toBe(179000);
    expect(dues).toBe(30680);
  });

  it('shows renewed once next year is paid, and pending first payment for new merchants', () => {
    const paidBaner = {
      ...BANER,
      periods: BANER.periods.map((period) => ({ ...period, isPaid: true })),
    };
    expect(getStatus(paidBaner, TODAY)).toBe(AMC_STATUSES.RENEWED);
    expect(getReminderLabel(paidBaner, TODAY)).toBe('');

    const newMerchant = { ...KONKAN, periods: [{ ...KONKAN.periods[0], isPaid: false }] };
    expect(getStatus(newMerchant, TODAY)).toBe(AMC_STATUSES.PENDING_FIRST_PAYMENT);
  });
});

describe('renewing', () => {
  it('only offers renewal when nothing is already invoiced or unpaid', () => {
    expect(canRenew(SAHYADRI, TODAY)).toBe(true);
    expect(canRenew(BANER, TODAY)).toBe(false);
  });

  it('starts the day after the current year ends and runs for a year', () => {
    expect(getRenewalFormValues(SAHYADRI, TODAY)).toEqual({ amount: '18000', start: '2026-08-23' });
    expect(getPeriodEnd('2026-08-23')).toBe('2027-08-22');
    expect(getPeriodEnd('2028-02-29')).toBe('2029-02-28');
  });

  it('refuses an overlapping start or no amount', () => {
    expect(validateRenewal({ amount: '0', start: '2026-08-22' }, SAHYADRI, TODAY)).toEqual([
      'Enter an amount greater than zero.',
      'The renewal must start after the current AMC ends on 22-08-2026.',
    ]);
  });

  it('numbers the renewal invoice in this financial year', () => {
    expect(
      createRenewalPeriod({ amount: '20000', start: '2026-08-23' }, INITIAL_CONTRACTS, TODAY),
    ).toEqual({
      invoiceNumber: 'AMC-2026-0003',
      invoiceDate: '2026-10-03',
      start: '2026-08-23',
      end: '2027-08-22',
      amount: 20000,
      isPaid: false,
    });
  });
});
