import { useState } from 'react';

import { PageHeader } from '@/components/PageHeader';
import { SelectField } from '@/components/SelectField';
import { StatGrid } from '@/components/StatGrid';
import { formatCurrency } from '@/utils/formatCurrency';

import { BOOKS_START_DATE } from '../constants';
import { findAccount, formatBalance, getAccountOptions, getMoneyAccounts } from '../utils/accounts';
import { getBalance, getLedger } from '../utils/ledger';
import { LedgerTable } from './LedgerTable';
import { PeriodFields } from './PeriodFields';
import styles from './Accounting.module.css';

/**
 * Balances of every bank and cash account, and the day-by-day book of one of them.
 *
 * @param {object} props
 * @param {ReturnType<import('../hooks/useAccounting').useAccounting>} props.books
 * @param {object[]} props.accounts
 * @param {string} props.todayIso
 */
export function BankBookView({ books, accounts, todayIso }) {
  const moneyAccounts = getMoneyAccounts(accounts);
  const [accountCode, setAccountCode] = useState(moneyAccounts[0].code);
  const [period, setPeriod] = useState({ from: BOOKS_START_DATE, to: todayIso });
  const account = findAccount(moneyAccounts, accountCode) ?? moneyAccounts[0];
  const balances = moneyAccounts.map((moneyAccount) => ({
    id: moneyAccount.code,
    label: moneyAccount.isActive === false ? `${moneyAccount.name} (closed)` : moneyAccount.name,
    balance: getBalance(moneyAccount, books.vouchers, todayIso),
  }));
  const total = balances.reduce((sum, item) => sum + item.balance, 0);

  return (
    <>
      <PageHeader
        title="Bank GL & bank book"
        description={`${formatCurrency(total)} in bank and cash today.`}
      />
      <div className={styles.body}>
        <StatGrid
          label="Bank and cash balances"
          stats={balances.map(({ id, label, balance }) => ({
            id,
            label,
            value: formatBalance(balance),
          }))}
        />
        <div className={styles.reportFilters}>
          <SelectField
            id="bank-book-account"
            label="Bank or cash account"
            className={styles.accountField}
            options={getAccountOptions(moneyAccounts)}
            value={account.code}
            onChange={(event) => setAccountCode(event.target.value)}
          />
          <PeriodFields idPrefix="bank-book" period={period} onChange={setPeriod} />
        </div>
        <LedgerTable
          caption={`Bank book: ${account.name}`}
          ledger={getLedger(account, accounts, books.vouchers, period)}
          period={period}
          debitLabel="Deposits"
          creditLabel="Withdrawals"
        />
      </div>
    </>
  );
}
