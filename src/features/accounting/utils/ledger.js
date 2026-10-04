import { ACCOUNT_TYPES, VOUCHER_STATUSES } from '../constants';
import { findAccount, isDebitNormal } from './accounts';

const { INCOME, EXPENSE } = ACCOUNT_TYPES;

/** Cancelled vouchers stay on record but never count. */
export function getPostedVouchers(vouchers) {
  return vouchers.filter((voucher) => voucher.status === VOUCHER_STATUSES.POSTED);
}

function byDateThenNumber(first, second) {
  return first.date.localeCompare(second.date) || first.number.localeCompare(second.number);
}

/** Every posted voucher line, flattened, with its voucher's details. Oldest first. */
function getPostings(vouchers) {
  return getPostedVouchers(vouchers)
    .sort(byDateThenNumber)
    .flatMap((voucher) =>
      voucher.lines.map((line, index) => ({ ...line, voucher, id: `${voucher.id}-${index}` })),
    );
}

function sumMovement(postings) {
  return postings.reduce((sum, posting) => sum + posting.debit - posting.credit, 0);
}

/** The other accounts in a voucher, which is what a ledger line shows as its particulars. */
function getParticulars(voucher, accountCode, accounts) {
  const names = voucher.lines
    .filter((line) => line.accountCode !== accountCode)
    .map((line) => findAccount(accounts, line.accountCode)?.name ?? line.accountCode);
  return [...new Set(names)].join(', ');
}

/** Signed balance (positive = debit) of an account at the end of `asOfIso`. */
export function getBalance(account, vouchers, asOfIso) {
  const postings = getPostings(vouchers).filter(
    (posting) => posting.accountCode === account.code && posting.voucher.date <= asOfIso,
  );
  return account.opening + sumMovement(postings);
}

/**
 * One account's ledger for a period: the balance brought forward, each entry with a running
 * balance, and the closing balance. Balances are signed: positive = debit.
 */
export function getLedger(account, accounts, vouchers, { from, to }) {
  const postings = getPostings(vouchers).filter((posting) => posting.accountCode === account.code);
  const opening =
    account.opening + sumMovement(postings.filter((posting) => posting.voucher.date < from));

  let balance = opening;
  const entries = postings
    .filter((posting) => posting.voucher.date >= from && posting.voucher.date <= to)
    .map((posting) => {
      balance += posting.debit - posting.credit;
      return {
        id: posting.id,
        date: posting.voucher.date,
        voucherNumber: posting.voucher.number,
        voucherType: posting.voucher.type,
        particulars: getParticulars(posting.voucher, account.code, accounts),
        narration: posting.voucher.narration,
        reference: posting.voucher.reference,
        debit: posting.debit,
        credit: posting.credit,
        balance,
      };
    });

  return {
    opening,
    entries,
    debit: entries.reduce((sum, entry) => sum + entry.debit, 0),
    credit: entries.reduce((sum, entry) => sum + entry.credit, 0),
    closing: balance,
  };
}

/** Every account's balance at a date in a debit or credit column. The two totals always agree. */
export function getTrialBalance(accounts, vouchers, asOfIso) {
  const rows = accounts
    .map((account) => {
      const balance = getBalance(account, vouchers, asOfIso);
      return {
        code: account.code,
        name: account.name,
        type: account.type,
        debit: balance > 0 ? balance : 0,
        credit: balance < 0 ? -balance : 0,
      };
    })
    .filter((row) => row.debit !== 0 || row.credit !== 0);

  return {
    rows,
    debit: rows.reduce((sum, row) => sum + row.debit, 0),
    credit: rows.reduce((sum, row) => sum + row.credit, 0),
  };
}

/** How much each account of a type moved in a period, on its normal side. Zero rows are left out. */
function getMovementsByAccount(accounts, vouchers, type, { from, to }) {
  const postings = getPostings(vouchers).filter(
    (posting) => posting.voucher.date >= from && posting.voucher.date <= to,
  );
  const sign = isDebitNormal(type) ? 1 : -1;
  return accounts
    .filter((account) => account.type === type)
    .map((account) => ({
      code: account.code,
      name: account.name,
      group: account.group,
      amount:
        sign * sumMovement(postings.filter((posting) => posting.accountCode === account.code)),
    }))
    .filter((row) => row.amount !== 0);
}

/** Income less expenses for a period. A negative net is a loss. */
export function getProfitAndLoss(accounts, vouchers, period) {
  const income = getMovementsByAccount(accounts, vouchers, INCOME, period);
  const expenses = getMovementsByAccount(accounts, vouchers, EXPENSE, period);
  const totalIncome = income.reduce((sum, row) => sum + row.amount, 0);
  const totalExpenses = expenses.reduce((sum, row) => sum + row.amount, 0);
  return { income, expenses, totalIncome, totalExpenses, net: totalIncome - totalExpenses };
}

/**
 * General ledger for every income or expense account in a period: each entry, oldest first, on
 * the account's normal side (a refund shows as a negative), plus a total per account.
 */
export function getGeneralLedger(accounts, vouchers, type, { from, to }, accountCode = '') {
  const sign = isDebitNormal(type) ? 1 : -1;
  const typeAccounts = accounts.filter(
    (account) => account.type === type && (accountCode === '' || account.code === accountCode),
  );
  const codes = new Set(typeAccounts.map((account) => account.code));
  const entries = getPostings(vouchers)
    .filter(
      (posting) =>
        codes.has(posting.accountCode) &&
        posting.voucher.date >= from &&
        posting.voucher.date <= to,
    )
    .map((posting) => ({
      id: posting.id,
      date: posting.voucher.date,
      voucherNumber: posting.voucher.number,
      accountName: findAccount(accounts, posting.accountCode)?.name ?? posting.accountCode,
      particulars: getParticulars(posting.voucher, posting.accountCode, accounts),
      narration: posting.voucher.narration,
      amount: sign * (posting.debit - posting.credit),
    }));

  return {
    entries,
    byAccount: getMovementsByAccount(typeAccounts, vouchers, type, { from, to }),
    total: entries.reduce((sum, entry) => sum + entry.amount, 0),
  };
}

function sumAmounts(rows) {
  return rows.reduce((sum, row) => sum + row.amount, 0);
}

/**
 * Assets against liabilities and capital at a date. Accounts sit on the side their balance falls
 * on, so an overdrawn bank shows as a liability. Capital includes the profit or loss for the year
 * so far, which is why the two sides agree.
 */
export function getBalanceSheet(accounts, vouchers, asOfIso, booksStartIso) {
  const assets = [];
  const liabilities = [];
  const capital = [];

  accounts
    .filter((account) => account.type !== INCOME && account.type !== EXPENSE)
    .forEach((account) => {
      const balance = getBalance(account, vouchers, asOfIso);
      if (balance === 0) return;
      const row = { code: account.code, name: account.name, note: account.group };
      if (account.type === ACCOUNT_TYPES.EQUITY) capital.push({ ...row, amount: -balance });
      else if (balance > 0) assets.push({ ...row, amount: balance });
      else liabilities.push({ ...row, amount: -balance });
    });

  const { net } = getProfitAndLoss(accounts, vouchers, { from: booksStartIso, to: asOfIso });
  if (net !== 0) {
    capital.push({
      code: 'profit-or-loss',
      name: net > 0 ? 'Profit for the year' : 'Loss for the year',
      note: 'From the profit & loss account',
      amount: net,
    });
  }

  const totalAssets = sumAmounts(assets);
  const totalLiabilities = sumAmounts(liabilities);
  const totalCapital = sumAmounts(capital);
  return {
    assets,
    liabilities,
    capital,
    totalAssets,
    totalLiabilities,
    totalCapital,
    isBalanced: totalAssets === totalLiabilities + totalCapital,
  };
}
