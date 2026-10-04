import { NAV_IDS } from '@/constants/navigation';
import { toIsoDate } from '@/utils/formatDate';

import { ACCOUNT_TYPES } from '../constants';
import { useAccounting } from '../hooks/useAccounting';
import { getAccounts } from '../utils/accounts';
import { BankBookView } from './BankBookView';
import { BanksView } from './BanksView';
import { GeneralLedgerView } from './GeneralLedgerView';
import { LedgersView } from './LedgersView';
import { TrialBalanceView } from './TrialBalanceView';
import { VouchersView } from './VouchersView';

/**
 * Every accounting page. It stays mounted while moving between them, so all the pages share one
 * set of vouchers and bank accounts.
 *
 * @param {object} props
 * @param {string} props.view - The accounting nav id to show, e.g. NAV_IDS.LEDGERS.
 * @param {Date} [props.today] - Injectable for tests.
 */
export function AccountingWorkspace({ view, today = new Date() }) {
  const books = useAccounting();
  const props = { books, accounts: getAccounts(books.banks), todayIso: toIsoDate(today) };

  switch (view) {
    case NAV_IDS.LEDGERS:
      return <LedgersView key={view} {...props} />;
    case NAV_IDS.TRIAL_BALANCE:
      return <TrialBalanceView key={view} {...props} />;
    case NAV_IDS.INCOME_GL:
      return <GeneralLedgerView key={view} type={ACCOUNT_TYPES.INCOME} {...props} />;
    case NAV_IDS.EXPENSE_GL:
      return <GeneralLedgerView key={view} type={ACCOUNT_TYPES.EXPENSE} {...props} />;
    case NAV_IDS.BANK_BOOK:
      return <BankBookView key={view} {...props} />;
    case NAV_IDS.BANKS:
      return <BanksView key={view} {...props} />;
    default:
      return <VouchersView key={view} today={today} {...props} />;
  }
}
