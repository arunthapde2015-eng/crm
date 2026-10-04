import { useState } from 'react';

import { PageHeader } from '@/components/PageHeader';
import { SelectField } from '@/components/SelectField';

import { BOOKS_START_DATE } from '../constants';
import { findAccount, formatBalance, getAccountOptions } from '../utils/accounts';
import { getLedger } from '../utils/ledger';
import { LedgerTable } from './LedgerTable';
import { PeriodFields } from './PeriodFields';
import styles from './Accounting.module.css';

/**
 * Any account's ledger for a chosen period.
 *
 * @param {object} props
 * @param {ReturnType<import('../hooks/useAccounting').useAccounting>} props.books
 * @param {object[]} props.accounts
 * @param {string} props.todayIso
 */
export function LedgersView({ books, accounts, todayIso }) {
  const [accountCode, setAccountCode] = useState(accounts[0].code);
  const [period, setPeriod] = useState({ from: BOOKS_START_DATE, to: todayIso });
  const account = findAccount(accounts, accountCode) ?? accounts[0];
  const ledger = getLedger(account, accounts, books.vouchers, period);

  return (
    <>
      <PageHeader
        title="Ledgers"
        description={`${account.name}: closing balance ${formatBalance(ledger.closing)}.`}
      />
      <div className={styles.body}>
        <div className={styles.reportFilters}>
          <SelectField
            id="ledger-account"
            label="Account"
            className={styles.accountField}
            options={getAccountOptions(accounts)}
            value={account.code}
            onChange={(event) => setAccountCode(event.target.value)}
          />
          <PeriodFields idPrefix="ledger" period={period} onChange={setPeriod} />
        </div>
        <LedgerTable caption={`Ledger: ${account.name}`} ledger={ledger} period={period} />
      </div>
    </>
  );
}
