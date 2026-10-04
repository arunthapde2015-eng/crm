import { useId, useState } from 'react';

import { DataTable } from '@/components/DataTable';
import { PageHeader } from '@/components/PageHeader';
import { Tabs } from '@/components/Tabs';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { ACCOUNT_TYPE_LABELS, BOOKS_START_DATE } from '../constants';
import { getBalanceSheet, getProfitAndLoss, getTrialBalance } from '../utils/ledger';
import { BalanceSheetStatement } from './BalanceSheetStatement';
import { PeriodFields } from './PeriodFields';
import { StatementSection } from './StatementSection';
import styles from './Accounting.module.css';

const TAB_IDS = {
  TRIAL_BALANCE: 'trial-balance',
  PROFIT_AND_LOSS: 'profit-and-loss',
  BALANCE_SHEET: 'balance-sheet',
};
const TABS = [
  { id: TAB_IDS.TRIAL_BALANCE, label: 'Trial balance' },
  { id: TAB_IDS.PROFIT_AND_LOSS, label: 'Profit & loss' },
  { id: TAB_IDS.BALANCE_SHEET, label: 'Balance sheet' },
];
const formatAmount = (amount) => (amount > 0 ? formatCurrency(amount) : '');
const formatDate = (isoDate) => formatDayMonthYear(parseIsoDate(isoDate));

function TrialBalanceTable({ trialBalance }) {
  return (
    <DataTable caption="Trial balance" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Account</th>
          <th scope="col">Type</th>
          <th scope="col" className={styles.numeric}>
            Debit
          </th>
          <th scope="col" className={styles.numeric}>
            Credit
          </th>
        </tr>
      </thead>
      <tbody>
        {trialBalance.rows.map((row) => (
          <tr key={row.code}>
            <th scope="row">
              {row.name}
              <span className={styles.subtext}>{row.code}</span>
            </th>
            <td>{ACCOUNT_TYPE_LABELS[row.type]}</td>
            <td className={styles.numeric}>{formatAmount(row.debit)}</td>
            <td className={styles.numeric}>{formatAmount(row.credit)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colSpan={2}>
            Total
          </th>
          <td className={styles.numeric}>{formatCurrency(trialBalance.debit)}</td>
          <td className={styles.numeric}>{formatCurrency(trialBalance.credit)}</td>
        </tr>
      </tfoot>
    </DataTable>
  );
}

function ProfitAndLossStatement({ profitAndLoss }) {
  const isProfit = profitAndLoss.net >= 0;
  return (
    <div className={styles.stack}>
      <StatementSection
        title="Income"
        rows={profitAndLoss.income}
        total={profitAndLoss.totalIncome}
      />
      <StatementSection
        title="Expenses"
        rows={profitAndLoss.expenses}
        total={profitAndLoss.totalExpenses}
      />
      <p className={isProfit ? styles.netProfit : styles.netLoss}>
        Net {isProfit ? 'profit' : 'loss'} {formatCurrency(Math.abs(profitAndLoss.net))}
      </p>
    </div>
  );
}

/**
 * Trial balance and balance sheet at the end of a period, and profit and loss over it.
 *
 * @param {object} props
 * @param {ReturnType<import('../hooks/useAccounting').useAccounting>} props.books
 * @param {object[]} props.accounts
 * @param {string} props.todayIso
 */
export function TrialBalanceView({ books, accounts, todayIso }) {
  const [period, setPeriod] = useState({ from: BOOKS_START_DATE, to: todayIso });
  const [activeTabId, setActiveTabId] = useState(TAB_IDS.TRIAL_BALANCE);
  const tabIdPrefix = useId();
  const trialBalance = getTrialBalance(accounts, books.vouchers, period.to);
  const profitAndLoss = getProfitAndLoss(accounts, books.vouchers, period);

  function renderStatement() {
    if (activeTabId === TAB_IDS.PROFIT_AND_LOSS) {
      return <ProfitAndLossStatement profitAndLoss={profitAndLoss} />;
    }
    if (activeTabId === TAB_IDS.BALANCE_SHEET) {
      return (
        <BalanceSheetStatement
          balanceSheet={getBalanceSheet(accounts, books.vouchers, period.to, BOOKS_START_DATE)}
          asOfIso={period.to}
          booksStartIso={BOOKS_START_DATE}
        />
      );
    }
    return <TrialBalanceTable trialBalance={trialBalance} />;
  }

  return (
    <>
      <PageHeader
        title="Trial balance, P&L"
        description={`Trial balance and balance sheet as at ${formatDate(period.to)}; profit and loss from ${formatDate(period.from)}.`}
      />
      <div className={styles.body}>
        <div className={styles.reportFilters}>
          <PeriodFields idPrefix="trial-balance" period={period} onChange={setPeriod} />
        </div>
        <Tabs
          tabs={TABS}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          label="Statements"
          idPrefix={tabIdPrefix}
        >
          {renderStatement()}
        </Tabs>
      </div>
    </>
  );
}
