import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { StatementSection } from './StatementSection';
import styles from './Accounting.module.css';

const NOTHING = 'Nothing at this date.';
const formatDate = (isoDate) => formatDayMonthYear(parseIsoDate(isoDate));

/**
 * Assets on one side, liabilities and capital on the other, with a check that they agree.
 *
 * @param {object} props
 * @param {ReturnType<import('../utils/ledger').getBalanceSheet>} props.balanceSheet
 * @param {string} props.asOfIso
 * @param {string} props.booksStartIso
 */
export function BalanceSheetStatement({ balanceSheet, asOfIso, booksStartIso }) {
  const liabilitiesAndCapital = balanceSheet.totalLiabilities + balanceSheet.totalCapital;

  return (
    <div className={styles.stack}>
      <p className={styles.formNote}>
        As at {formatDate(asOfIso)}. Profit or loss is for the year so far, from{' '}
        {formatDate(booksStartIso)}.
      </p>
      <div className={styles.balanceSheet}>
        <StatementSection
          title="Assets"
          rows={balanceSheet.assets}
          total={balanceSheet.totalAssets}
          emptyText={NOTHING}
        />
        <div className={styles.stack}>
          <StatementSection
            title="Liabilities"
            rows={balanceSheet.liabilities}
            total={balanceSheet.totalLiabilities}
            emptyText={NOTHING}
          />
          <StatementSection
            title="Capital"
            rows={balanceSheet.capital}
            total={balanceSheet.totalCapital}
            emptyText={NOTHING}
          />
        </div>
      </div>
      {balanceSheet.isBalanced ? (
        <p className={styles.balanceCheck}>
          Assets {formatCurrency(balanceSheet.totalAssets)} = liabilities and capital{' '}
          {formatCurrency(liabilitiesAndCapital)}
        </p>
      ) : (
        <p className={styles.cancelNote} role="alert">
          Assets {formatCurrency(balanceSheet.totalAssets)} don’t match liabilities and capital{' '}
          {formatCurrency(liabilitiesAndCapital)}. Check the opening balances.
        </p>
      )}
    </div>
  );
}
