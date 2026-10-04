import { useState } from 'react';

import { BADGE_TONES, Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { PageHeader } from '@/components/PageHeader';
import { formatCurrency } from '@/utils/formatCurrency';

import { findAccount, formatBalance } from '../utils/accounts';
import { createBank, getCloseBlocker, getEmptyBankValues, maskAccountNumber } from '../utils/banks';
import { getBalance } from '../utils/ledger';
import { BankForm } from './BankForm';
import styles from './Accounting.module.css';

/**
 * The company's bank accounts: add new ones, and close or reopen them.
 *
 * @param {object} props
 * @param {ReturnType<import('../hooks/useAccounting').useAccounting>} props.books
 * @param {object[]} props.accounts
 * @param {string} props.todayIso
 */
export function BanksView({ books, accounts, todayIso }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const rows = books.banks.map((bank) => ({
    ...bank,
    balance: getBalance(findAccount(accounts, bank.code), books.vouchers, todayIso),
  }));
  const total = rows.reduce((sum, row) => sum + row.balance, 0);
  const activeCount = rows.filter((row) => row.isActive).length;

  function handleSubmit(values) {
    books.addBank(createBank(values, books.banks));
    setIsFormOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Manage banks"
        description={`${activeCount} active bank ${activeCount === 1 ? 'account' : 'accounts'}, ${formatCurrency(total)} in bank today.`}
        actions={
          <Button onClick={() => setIsFormOpen(true)} disabled={isFormOpen}>
            Add bank account
          </Button>
        }
      />
      <div className={styles.body}>
        {isFormOpen && (
          <BankForm
            initialValues={getEmptyBankValues()}
            banks={books.banks}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        )}
        <DataTable caption="Bank accounts" tableClassName={styles.table}>
          <thead>
            <tr>
              <th scope="col">Account</th>
              <th scope="col">Bank</th>
              <th scope="col">Account no.</th>
              <th scope="col">IFSC</th>
              <th scope="col" className={styles.numeric}>
                Opening
              </th>
              <th scope="col" className={styles.numeric}>
                Balance today
              </th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const closeBlocker = row.isActive ? getCloseBlocker(row.balance) : '';
              const hintId = `bank-close-hint-${row.code}`;
              return (
                <tr key={row.code} className={row.isActive ? undefined : styles.voidRow}>
                  <th scope="row">
                    {row.name}
                    <span className={styles.subtext}>
                      {row.code}, {row.accountType}
                    </span>
                  </th>
                  <td>
                    {row.bankName}
                    {row.branch && <span className={styles.subtext}>{row.branch}</span>}
                  </td>
                  <td className={styles.nowrap}>{maskAccountNumber(row.accountNumber)}</td>
                  <td className={styles.nowrap}>{row.ifsc}</td>
                  <td className={styles.numeric}>{formatBalance(row.openingBalance)}</td>
                  <td className={styles.numeric}>{formatBalance(row.balance)}</td>
                  <td>
                    <Badge tone={row.isActive ? BADGE_TONES.SUCCESS : BADGE_TONES.NEUTRAL}>
                      {row.isActive ? 'Active' : 'Closed'}
                    </Badge>
                  </td>
                  <td className={styles.actions}>
                    <Button
                      variant="secondary"
                      aria-label={`${row.isActive ? 'Close' : 'Reopen'} ${row.name}`}
                      aria-describedby={closeBlocker ? hintId : undefined}
                      disabled={Boolean(closeBlocker)}
                      onClick={() => books.setBankActive(row.code, !row.isActive)}
                    >
                      {row.isActive ? 'Close' : 'Reopen'}
                    </Button>
                    {closeBlocker && (
                      <span id={hintId} className={styles.subtext}>
                        {closeBlocker}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </div>
    </>
  );
}
