import { INITIAL_BANKS, INITIAL_VOUCHERS, VOUCHER_TYPES } from '../constants';
import { findAccount, formatBalance, getAccounts } from './accounts';
import { createBank, getCloseBlocker, maskAccountNumber, validateBank } from './banks';
import {
  getBalance,
  getBalanceSheet,
  getGeneralLedger,
  getLedger,
  getProfitAndLoss,
  getTrialBalance,
} from './ledger';
import {
  cancelVoucher,
  createVoucher,
  filterVouchers,
  getEmptyVoucherValues,
  validateVoucher,
} from './vouchers';

const TODAY = new Date(2026, 9, 3);
const TODAY_ISO = '2026-10-03';
const YEAR = { from: '2026-04-01', to: TODAY_ISO };
const ACCOUNTS = getAccounts(INITIAL_BANKS);
const account = (code) => findAccount(ACCOUNTS, code);

describe('balances', () => {
  it('keeps the books balanced', () => {
    const trialBalance = getTrialBalance(ACCOUNTS, INITIAL_VOUCHERS, TODAY_ISO);
    expect(trialBalance.debit).toBe(trialBalance.credit);
    expect(trialBalance.debit).toBe(974000);
  });

  it('works out bank, cash and party balances', () => {
    expect(getBalance(account('1010'), INITIAL_VOUCHERS, TODAY_ISO)).toBe(76070);
    expect(getBalance(account('1020'), INITIAL_VOUCHERS, TODAY_ISO)).toBe(65870);
    expect(getBalance(account('1030'), INITIAL_VOUCHERS, TODAY_ISO)).toBe(27684);
    expect(getBalance(account('1100'), INITIAL_VOUCHERS, TODAY_ISO)).toBe(112000);
    expect(getBalance(account('2100'), INITIAL_VOUCHERS, TODAY_ISO)).toBe(-63720);
    expect(formatBalance(-63720)).toBe('₹63,720 Cr');
  });

  it('brings the balance forward into a ledger period', () => {
    const ledger = getLedger(account('1030'), ACCOUNTS, INITIAL_VOUCHERS, {
      from: '2026-07-01',
      to: TODAY_ISO,
    });
    expect(ledger.opening).toBe(7684);
    expect(ledger.entries).toEqual([
      expect.objectContaining({
        voucherNumber: 'CV-2026-0001',
        particulars: 'HDFC Bank current account',
        debit: 20000,
        balance: 27684,
      }),
    ]);
    expect(ledger.closing).toBe(27684);
  });

  it('works out profit or loss', () => {
    const profitAndLoss = getProfitAndLoss(ACCOUNTS, INITIAL_VOUCHERS, YEAR);
    expect(profitAndLoss.totalIncome).toBe(246000);
    expect(profitAndLoss.totalExpenses).toBe(606100);
    expect(profitAndLoss.net).toBe(-360100);
    expect(
      getProfitAndLoss(ACCOUNTS, INITIAL_VOUCHERS, { from: '2026-07-01', to: '2026-07-31' }),
    ).toMatchObject({ totalIncome: 150000, totalExpenses: 153000 });
  });

  it('lists income GL entries with totals by account', () => {
    const gl = getGeneralLedger(ACCOUNTS, INITIAL_VOUCHERS, 'income', YEAR);
    expect(gl.entries.map((entry) => [entry.voucherNumber, entry.amount])).toEqual([
      ['SV-2026-0001', 72000],
      ['SV-2026-0002', 24000],
      ['SV-2026-0003', 150000],
    ]);
    expect(gl.byAccount).toEqual([
      expect.objectContaining({ name: 'Software sales', amount: 222000 }),
      expect.objectContaining({ name: 'AMC income', amount: 24000 }),
    ]);
  });

  it('leaves cancelled vouchers out', () => {
    const vouchers = INITIAL_VOUCHERS.map((voucher) =>
      voucher.number === 'CV-2026-0001' ? cancelVoucher(voucher, ' Entered twice ') : voucher,
    );
    expect(getBalance(account('1030'), vouchers, TODAY_ISO)).toBe(7684);
    expect(vouchers.find((voucher) => voucher.number === 'CV-2026-0001').cancelReason).toBe(
      'Entered twice',
    );
  });
});

describe('vouchers', () => {
  const lines = (...entries) =>
    entries.map(([accountCode, debit, credit], index) => ({
      id: String(index),
      accountCode,
      debit: String(debit ?? ''),
      credit: String(credit ?? ''),
    }));

  it('finds vouchers by account or reference', () => {
    const numbers = (query, type = 'all') =>
      filterVouchers(INITIAL_VOUCHERS, ACCOUNTS, { query, type }).map((voucher) => voucher.number);
    expect(numbers('salaries')).toEqual(['JV-2026-0001']);
    expect(numbers('utr719260318')).toEqual(['PV-2026-0005']);
    expect(numbers('', VOUCHER_TYPES.RECEIPT)).toEqual([
      'RV-2026-0003',
      'RV-2026-0002',
      'RV-2026-0001',
    ]);
  });

  it('refuses vouchers that do not balance', () => {
    const values = {
      ...getEmptyVoucherValues(TODAY),
      narration: 'Bank charges',
      lines: lines(['5170', 500], ['1010', '', 400], ['', '', '']),
    };
    expect(validateVoucher(values, ACCOUNTS, TODAY_ISO)).toEqual([
      "Debits ₹500 and credits ₹400 don't match.",
    ]);
    expect(
      validateVoucher(
        { ...values, date: '2026-03-31', narration: ' ', lines: lines(['5170', 500, 500]) },
        ACCOUNTS,
        TODAY_ISO,
      ),
    ).toEqual([
      'The books start on 01-04-2026.',
      'Enter a narration.',
      'Enter at least two lines.',
      'Line 1: enter either a debit or a credit.',
    ]);
  });

  it('checks the voucher type against the accounts used', () => {
    const values = {
      ...getEmptyVoucherValues(TODAY, VOUCHER_TYPES.CONTRA),
      narration: 'Wrong contra',
      lines: lines(['5170', 500], ['1010', '', 500]),
    };
    expect(validateVoucher(values, ACCOUNTS, TODAY_ISO)).toEqual([
      'A contra voucher can only move money between bank and cash accounts.',
    ]);
    expect(
      validateVoucher({ ...values, type: VOUCHER_TYPES.RECEIPT }, ACCOUNTS, TODAY_ISO),
    ).toEqual(['A receipt must debit the bank or cash account the money went into.']);
    expect(
      validateVoucher({ ...values, type: VOUCHER_TYPES.PAYMENT }, ACCOUNTS, TODAY_ISO),
    ).toEqual([]);
  });

  it('numbers new vouchers per type and financial year', () => {
    const values = {
      ...getEmptyVoucherValues(TODAY),
      narration: ' Bank charges ',
      lines: lines(['5170', 500], ['1010', '', 500], ['', '', '']),
    };
    expect(createVoucher(values, INITIAL_VOUCHERS)).toMatchObject({
      number: 'PV-2026-0013',
      narration: 'Bank charges',
      lines: [
        { accountCode: '5170', debit: 500, credit: 0 },
        { accountCode: '1010', debit: 0, credit: 500 },
      ],
    });
  });
});

describe('banks', () => {
  const values = {
    name: 'ICICI current account',
    bankName: 'ICICI Bank',
    accountNumber: '000405012345',
    ifsc: 'icic0000004',
    branch: 'Baner',
    accountType: 'Current',
    openingBalance: '0',
  };

  it('checks account details', () => {
    expect(
      validateBank(
        { ...values, name: 'hdfc bank current account', accountNumber: '38912345678', ifsc: 'X' },
        INITIAL_BANKS,
      ),
    ).toEqual([
      'hdfc bank current account is already an account.',
      'This account number is already added.',
      'Enter a valid 11-character IFSC, e.g. HDFC0001234.',
    ]);
    expect(validateBank({ ...values, openingBalance: '-100' }, INITIAL_BANKS)).toEqual([
      'Only an overdraft account can open below zero.',
    ]);
  });

  it('gives a new bank the next free code', () => {
    expect(createBank(values, INITIAL_BANKS)).toMatchObject({ code: '1040', ifsc: 'ICIC0000004' });
    expect(maskAccountNumber('000405012345')).toBe('XXXX2345');
    expect(getCloseBlocker(76070)).toBe('Bring the balance to ₹0 before closing this account.');
  });
});

describe('balance sheet', () => {
  it('balances assets against liabilities, capital and the loss so far', () => {
    const sheet = getBalanceSheet(ACCOUNTS, INITIAL_VOUCHERS, TODAY_ISO, '2026-04-01');
    expect(sheet.assets.map((row) => [row.name, row.amount])).toEqual([
      ['HDFC Bank current account', 76070],
      ['SBI current account', 65870],
      ['Cash in hand', 27684],
      ['Trade receivables', 112000],
      ['Input GST', 86276],
    ]);
    expect(sheet.liabilities.map((row) => [row.name, row.amount])).toEqual([
      ['Trade payables', 63720],
      ['Output GST', 44280],
      ['Salaries payable', 120000],
    ]);
    expect(sheet.capital.map((row) => [row.name, row.amount])).toEqual([
      ['Capital account', 500000],
      ['Loss for the year', -360100],
    ]);
    expect(sheet).toMatchObject({
      totalAssets: 367900,
      totalLiabilities: 228000,
      totalCapital: 139900,
      isBalanced: true,
    });
  });

  it('shows an overdrawn bank as a liability', () => {
    const overdraft = {
      id: 'OD',
      number: 'PV-2026-0099',
      type: VOUCHER_TYPES.PAYMENT,
      date: '2026-10-01',
      narration: 'Large payment',
      reference: '',
      lines: [
        { accountCode: '5100', debit: 100000, credit: 0 },
        { accountCode: '1020', debit: 0, credit: 100000 },
      ],
      status: 'posted',
      cancelReason: '',
    };
    const sheet = getBalanceSheet(
      ACCOUNTS,
      [...INITIAL_VOUCHERS, overdraft],
      TODAY_ISO,
      '2026-04-01',
    );
    expect(sheet.liabilities).toContainEqual(
      expect.objectContaining({ name: 'SBI current account', amount: 34130 }),
    );
    expect(sheet.isBalanced).toBe(true);
  });
});
