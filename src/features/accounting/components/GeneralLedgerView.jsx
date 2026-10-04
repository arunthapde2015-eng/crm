import { useState } from 'react';

import { DataTable } from '@/components/DataTable';
import { PageHeader } from '@/components/PageHeader';
import { SelectField } from '@/components/SelectField';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { ACCOUNT_TYPES, BOOKS_START_DATE } from '../constants';
import { getAccountOptions } from '../utils/accounts';
import { getGeneralLedger } from '../utils/ledger';
import { PeriodFields } from './PeriodFields';
import styles from './Accounting.module.css';

const COPY = {
  [ACCOUNT_TYPES.INCOME]: { title: 'Income GL', noun: 'income', allLabel: 'All income accounts' },
  [ACCOUNT_TYPES.EXPENSE]: {
    title: 'Expense GL',
    noun: 'expenses',
    allLabel: 'All expense accounts',
  },
};
const formatDate = (isoDate) => formatDayMonthYear(parseIsoDate(isoDate));

/**
 * Every entry to income (or expense) accounts in a period, with totals per account.
 *
 * @param {object} props
 * @param {'income' | 'expense'} props.type - One of ACCOUNT_TYPES.
 * @param {ReturnType<import('../hooks/useAccounting').useAccounting>} props.books
 * @param {object[]} props.accounts
 * @param {string} props.todayIso
 */
export function GeneralLedgerView({ type, books, accounts, todayIso }) {
  const [period, setPeriod] = useState({ from: BOOKS_START_DATE, to: todayIso });
  const [accountCode, setAccountCode] = useState('');
  const { title, noun, allLabel } = COPY[type];
  const typeAccounts = accounts.filter((account) => account.type === type);
  const gl = getGeneralLedger(accounts, books.vouchers, type, period, accountCode);

  return (
    <>
      <PageHeader
        title={title}
        description={`${formatCurrency(gl.total)} ${noun} from ${formatDate(period.from)} to ${formatDate(period.to)}.`}
      />
      <div className={styles.body}>
        <div className={styles.reportFilters}>
          <SelectField
            id={`${type}-gl-account`}
            label="Account"
            className={styles.accountField}
            options={[{ value: '', label: allLabel }, ...getAccountOptions(typeAccounts)]}
            value={accountCode}
            onChange={(event) => setAccountCode(event.target.value)}
          />
          <PeriodFields idPrefix={`${type}-gl`} period={period} onChange={setPeriod} />
        </div>

        <ul className={styles.chips} aria-label={`Totals by ${noun} account`}>
          {gl.byAccount.map((row) => (
            <li key={row.code}>
              {row.name} <strong>{formatCurrency(row.amount)}</strong>
            </li>
          ))}
        </ul>

        <DataTable caption={title} tableClassName={styles.table}>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Voucher</th>
              <th scope="col">Account</th>
              <th scope="col">Particulars</th>
              <th scope="col" className={styles.numeric}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {gl.entries.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  No {noun} in this period.
                </td>
              </tr>
            )}
            {gl.entries.map((entry) => (
              <tr key={entry.id}>
                <td className={styles.nowrap}>{formatDate(entry.date)}</td>
                <td className={styles.nowrap}>{entry.voucherNumber}</td>
                <td>{entry.accountName}</td>
                <td>
                  {entry.particulars}
                  <span className={styles.subtext}>{entry.narration}</span>
                </td>
                <td className={styles.numeric}>{formatCurrency(entry.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={4}>
                Total
              </th>
              <td className={styles.numeric}>{formatCurrency(gl.total)}</td>
            </tr>
          </tfoot>
        </DataTable>
      </div>
    </>
  );
}
