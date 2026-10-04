import { AccountingWorkspace } from '@/features/accounting';

/** Every accounting sub-page; `view` is the accounting nav id. */
export function AccountingPage({ view }) {
  return <AccountingWorkspace view={view} />;
}
