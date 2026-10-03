import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { NAV_IDS } from '@/constants/navigation';
import { CURRENT_USER } from '@/constants/session';
import {
  ATTENTION_STATS,
  DashboardStats,
  MONEY_STATS,
  SALES_FUNNEL_STAGES,
  SalesFunnel,
  formatLongDate,
  getGreeting,
} from '@/features/dashboard';

import styles from './DashboardPage.module.css';

/**
 * @param {object} props
 * @param {(navId: string) => void} props.onNavigate
 */
export function DashboardPage({ onNavigate }) {
  const now = new Date();
  const firstName = CURRENT_USER.name.split(' ')[0];

  return (
    <>
      <PageHeader
        title={`${getGreeting(now)}, ${firstName}`}
        description={formatLongDate(now)}
        actions={
          <>
            <Button onClick={() => onNavigate(NAV_IDS.LEADS)}>Add lead</Button>
            <Button variant="secondary" onClick={() => onNavigate(NAV_IDS.QUOTATIONS)}>
              New quotation
            </Button>
          </>
        }
      />
      <div className={styles.sections}>
        <DashboardStats title="Needs attention" stats={ATTENTION_STATS} />
        <DashboardStats title="Sales & collections" stats={MONEY_STATS} />
        <SalesFunnel stages={SALES_FUNNEL_STAGES} />
      </div>
    </>
  );
}
