import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { DEFAULT_NAV_ID, NAV_IDS, NAV_ITEMS } from '@/constants/navigation';
import { CURRENT_USER } from '@/constants/session';
import { AccessDeniedPage } from '@/pages/AccessDeniedPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FollowUpsPage } from '@/pages/FollowUpsPage';
import { HomePage } from '@/pages/HomePage';
import { LeadsPage } from '@/pages/LeadsPage';
import { MyHrPage } from '@/pages/MyHrPage';
import { PipelinePage } from '@/pages/PipelinePage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { canAccessNav } from '@/utils/permissions';

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

function renderPage(navId, onNavigate) {
  if (!canAccessNav(CURRENT_USER.role, navId)) return <AccessDeniedPage />;
  if (navId === NAV_IDS.DASHBOARD) return <DashboardPage onNavigate={onNavigate} />;
  if (navId === NAV_IDS.SETTINGS) return <SettingsPage />;
  if (navId === NAV_IDS.TASKS) return <HomePage />;
  if (navId === NAV_IDS.MY_HR) return <MyHrPage />;
  if (navId === NAV_IDS.LEADS) return <LeadsPage />;
  if (navId === NAV_IDS.PIPELINE) return <PipelinePage />;
  if (navId === NAV_IDS.FOLLOW_UPS) return <FollowUpsPage />;
  if (navId === NAV_IDS.CUSTOMERS) return <CustomersPage />;

  const navItem = NAV_ITEMS.find((item) => item.id === navId);
  return <PlaceholderPage title={navItem?.label ?? 'Not found'} />;
}

export function App() {
  const [activeNavId, setActiveNavId] = useState(DEFAULT_NAV_ID);

  return (
    <AppLayout activeNavId={activeNavId} onNavigate={setActiveNavId}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error) => console.error(error)}
        resetKeys={[activeNavId]}
      >
        {renderPage(activeNavId, setActiveNavId)}
      </ErrorBoundary>
    </AppLayout>
  );
}
