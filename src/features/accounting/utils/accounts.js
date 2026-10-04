import { formatCurrency } from '@/utils/formatCurrency';

import { ACCOUNT_TYPES, BANK_GROUP, CHART_OF_ACCOUNTS } from '../constants';

/** A bank from Manage banks as a ledger account. */
function toBankAccount(bank) {
  return {
    code: bank.code,
    name: bank.name,
    type: ACCOUNT_TYPES.ASSET,
    group: BANK_GROUP,
    opening: bank.openingBalance,
    isMoney: true,
    isBank: true,
    isActive: bank.isActive,
  };
}

/** Every ledger account, banks included, in code order. */
export function getAccounts(banks) {
  return [...banks.map(toBankAccount), ...CHART_OF_ACCOUNTS].sort((first, second) =>
    first.code.localeCompare(second.code),
  );
}

export function findAccount(accounts, code) {
  return accounts.find((account) => account.code === code) ?? null;
}

/** Bank and cash accounts, the ones money is paid into or out of. */
export function getMoneyAccounts(accounts) {
  return accounts.filter((account) => account.isMoney);
}

/** Assets and expenses normally carry a debit balance; everything else a credit balance. */
export function isDebitNormal(type) {
  return type === ACCOUNT_TYPES.ASSET || type === ACCOUNT_TYPES.EXPENSE;
}

/** Signed balance (positive = debit) as "₹76,070 Dr" / "₹5,00,000 Cr". */
export function formatBalance(balance) {
  if (balance === 0) return formatCurrency(0);
  return `${formatCurrency(Math.abs(balance))} ${balance > 0 ? 'Dr' : 'Cr'}`;
}

export function getAccountOptions(accounts, { onlyActive = false } = {}) {
  return accounts
    .filter((account) => !onlyActive || account.isActive !== false)
    .map((account) => ({ value: account.code, label: `${account.code} · ${account.name}` }));
}
