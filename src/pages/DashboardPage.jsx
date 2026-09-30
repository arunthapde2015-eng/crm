import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { NAV_IDS } from '@/constants/navigation';
import { ROLE_LABELS } from '@/constants/roles';
import { CURRENT_USER } from '@/constants/session';
import {
  DASHBOARD_STATS,
  DashboardStats,
  SALES_FUNNEL_STAGES,
  SalesFunnel,
  formatLongDate,
  getGreeting,
} from '@/features/dashboard';

/**
 * @param {object} props
 * @param {(navId: string) => void} props.onNavigate
 */
export function DashboardPage({ onNavigate }) {
  const now = new Date();
  const firstName = CURRENT_USER.name.split(' ')[0];
  const roleLabel = ROLE_LABELS[CURRENT_USER.role];

  return (
    <>
      <PageHeader
        eyebrow="Admin Dashboard"
        title={`${getGreeting(now)}, ${firstName}`}
        description={`${formatLongDate(now)}. ${roleLabel} view.`}
        actions={
          <>
            <Button onClick={() => onNavigate(NAV_IDS.LEADS)}>Add lead</Button>
            <Button variant="secondary" onClick={() => onNavigate(NAV_IDS.QUOTATIONS)}>
              New quotation
            </Button>
          </>
        }
      />
      <DashboardStats stats={DASHBOARD_STATS} />
      <SalesFunnel stages={SALES_FUNNEL_STAGES} />
    </>
  );
}
