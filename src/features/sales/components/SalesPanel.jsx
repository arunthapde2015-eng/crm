import { useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Tabs } from '@/components/Tabs';
import { NAV_IDS } from '@/constants/navigation';

import { SALES_TAB_IDS, SALES_TABS } from '../constants';
import { useSalesData } from '../hooks/useSalesData';
import { CollectionsTab } from './CollectionsTab';
import { OrdersTab } from './OrdersTab';
import { SalesOverview } from './SalesOverview';
import { TargetsTab } from './TargetsTab';
import { TeamTab } from './TeamTab';

/**
 * Sales Management: overview, orders, collections, team and targets.
 * Leads, pipeline, follow-ups and incentives have their own pages; the header links to them.
 *
 * @param {object} props
 * @param {(navId: string) => void} props.onNavigate
 * @param {Date} [props.today] - Reference date for periods and ageing; injectable for tests.
 * @param {object} [props.initialData] - Seed data; defaults to the placeholder sales data.
 */
export function SalesPanel({ onNavigate, today = new Date(), initialData }) {
  const sales = useSalesData(initialData);
  const { data } = sales;
  const [activeTabId, setActiveTabId] = useState(SALES_TAB_IDS.OVERVIEW);

  function renderTab() {
    switch (activeTabId) {
      case SALES_TAB_IDS.ORDERS:
        return (
          <OrdersTab
            data={data}
            today={today}
            onAddOrder={sales.addOrder}
            onStatusChange={sales.setOrderStatus}
          />
        );
      case SALES_TAB_IDS.COLLECTIONS:
        return <CollectionsTab data={data} today={today} onAddPayment={sales.addPayment} />;
      case SALES_TAB_IDS.TEAM:
        return (
          <TeamTab
            team={data.team}
            onAdd={sales.addMember}
            onUpdate={sales.updateMember}
            onSetStatus={sales.setMemberStatus}
          />
        );
      case SALES_TAB_IDS.TARGETS:
        return <TargetsTab data={data} today={today} onSetTarget={sales.setTarget} />;
      default:
        return <SalesOverview data={data} today={today} />;
    }
  }

  return (
    <>
      <PageHeader
        title="Sales Management"
        description="Orders, collections, team and targets in one place."
        actions={
          <>
            <Button variant="secondary" onClick={() => onNavigate(NAV_IDS.LEADS)}>
              Leads
            </Button>
            <Button variant="secondary" onClick={() => onNavigate(NAV_IDS.PIPELINE)}>
              Pipeline
            </Button>
            <Button variant="secondary" onClick={() => onNavigate(NAV_IDS.FOLLOW_UPS)}>
              Follow-ups
            </Button>
            <Button variant="secondary" onClick={() => onNavigate(NAV_IDS.INCENTIVES)}>
              Incentives
            </Button>
          </>
        }
      />
      <Tabs
        tabs={SALES_TABS}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        label="Sales management sections"
        idPrefix="sales"
      >
        {renderTab()}
      </Tabs>
    </>
  );
}
