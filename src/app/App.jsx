import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { ACCOUNTING_NAV_IDS, NAV_IDS, NAV_ITEMS } from '@/constants/navigation';
import { ACCESS_LEVELS } from '@/constants/roles';
import { useAuth } from '@/context/AuthContext';
import { ChangePasswordPage, LoginPage } from '@/features/auth';
import { AccessDeniedPage } from '@/pages/AccessDeniedPage';
import { AccountingPage } from '@/pages/AccountingPage';
import { CallDeskPage } from '@/pages/CallDeskPage';
import { AmcPage } from '@/pages/AmcPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { FollowUpsPage } from '@/pages/FollowUpsPage';
import { IncentivesPage } from '@/pages/IncentivesPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { LeadsPage } from '@/pages/LeadsPage';
import { MerchantsPage } from '@/pages/MerchantsPage';
import { MyHrPage } from '@/pages/MyHrPage';
import { PipelinePage } from '@/pages/PipelinePage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { ProformasPage } from '@/pages/ProformasPage';
import { PurchasesPage } from '@/pages/PurchasesPage';
import { QuotationsPage } from '@/pages/QuotationsPage';
import { ReceiptsPage } from '@/pages/ReceiptsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SalesPage } from '@/pages/SalesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TasksPage } from '@/pages/TasksPage';
import { TicketsPage } from '@/pages/TicketsPage';
import { UsersPage } from '@/pages/UsersPage';
import { canAccessNav, getAccessLevel, getHomeNavId } from '@/utils/permissions';

import { AppLayout } from './layout/AppLayout';
import styles from './App.module.css';

function ErrorFallback({ resetErrorBoundary }) {
  return (
    <div role="alert" className={styles.error}>
      <p>Something went wrong.</p>
      <button type="button" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
}

function renderPage(navId, role, onNavigate) {
  if (!canAccessNav(role, navId)) return <AccessDeniedPage />;
  if (navId === NAV_IDS.DASHBOARD) return <DashboardPage onNavigate={onNavigate} />;
  if (navId === NAV_IDS.SETTINGS) return <SettingsPage />;
  if (navId === NAV_IDS.TASKS) return <TasksPage onNavigate={onNavigate} />;
  if (navId === NAV_IDS.MY_HR) return <MyHrPage />;
  if (navId === NAV_IDS.LEADS) return <LeadsPage />;
  if (navId === NAV_IDS.PIPELINE) return <PipelinePage />;
  if (navId === NAV_IDS.FOLLOW_UPS) return <FollowUpsPage />;
  if (navId === NAV_IDS.MERCHANTS) return <MerchantsPage onNavigate={onNavigate} />;
  if (navId === NAV_IDS.REPORTS) return <ReportsPage />;
  if (navId === NAV_IDS.SALES) return <SalesPage onNavigate={onNavigate} />;
  if (navId === NAV_IDS.QUOTATIONS) return <QuotationsPage />;
  if (navId === NAV_IDS.INCENTIVES) return <IncentivesPage />;
  if (navId === NAV_IDS.PROFORMA_INVOICES) return <ProformasPage onNavigate={onNavigate} />;
  if (navId === NAV_IDS.SALES_INVOICES) return <InvoicesPage />;
  if (navId === NAV_IDS.PAYMENTS_RECEIPTS) return <ReceiptsPage />;
  if (navId === NAV_IDS.AMC_RENEWALS) return <AmcPage onNavigate={onNavigate} />;
  if (navId === NAV_IDS.EXPENSES) return <ExpensesPage />;
  if (navId === NAV_IDS.PURCHASES) return <PurchasesPage />;
  if (navId === NAV_IDS.CALL_DESK) return <CallDeskPage onNavigate={onNavigate} />;
  if (navId === NAV_IDS.SUPPORT_TICKETS) return <TicketsPage />;
  if (navId === NAV_IDS.USERS) return <UsersPage key={navId} />;
  if (navId === NAV_IDS.ROLES_PERMISSIONS) return <UsersPage key={navId} initialTab="roles" />;
  // One page for every accounting view, so moving between them keeps the same books.
  if (ACCOUNTING_NAV_IDS.includes(navId)) return <AccountingPage view={navId} />;

  const navItem = NAV_ITEMS.find((item) => item.id === navId);
  return <PlaceholderPage title={navItem?.label ?? 'Not found'} />;
}

/** The app for a signed-in user. Remounted per user, so each starts on their own home page. */
function SignedInApp({ role }) {
  const [activeNavId, setActiveNavId] = useState(() => getHomeNavId(role));
  const isViewOnly = getAccessLevel(role, activeNavId) === ACCESS_LEVELS.VIEW;

  return (
    <AppLayout activeNavId={activeNavId} onNavigate={setActiveNavId}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error) => console.error(error)}
        resetKeys={[activeNavId]}
      >
        {isViewOnly && (
          <p className={styles.viewOnly} role="note">
            View only: your role ({role.name}) can see this page but shouldn’t make changes here.
          </p>
        )}
        {renderPage(activeNavId, role, setActiveNavId)}
      </ErrorBoundary>
    </AppLayout>
  );
}

/** Sign-in first, then a new password if theirs is temporary, then the app. */
export function App() {
  const { currentUser, currentRole } = useAuth();

  if (!currentUser) return <LoginPage />;
  if (currentUser.mustChangePassword) return <ChangePasswordPage />;
  return <SignedInApp key={currentUser.id} role={currentRole} />;
}
