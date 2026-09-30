import { useState } from 'react';

import { Tabs } from '@/components/Tabs';

import { DEFAULT_HR_TAB_ID, HR_TAB_IDS, HR_TABS } from '../constants';
import { HrOverview } from './HrOverview';
import styles from './MyHrPanel.module.css';

export function MyHrPanel({ initialTabId = DEFAULT_HR_TAB_ID }) {
  const [activeTabId, setActiveTabId] = useState(initialTabId);

  function renderTabContent() {
    if (activeTabId === HR_TAB_IDS.OVERVIEW) {
      return <HrOverview onApplyForLeave={() => setActiveTabId(HR_TAB_IDS.LEAVE)} />;
    }

    const tabLabel = HR_TABS.find((tab) => tab.id === activeTabId)?.label;
    return <p className={styles.empty}>{tabLabel} is not available yet.</p>;
  }

  return (
    <Tabs
      tabs={HR_TABS}
      activeTabId={activeTabId}
      onTabChange={setActiveTabId}
      label="My HR sections"
      idPrefix="my-hr"
    >
      {renderTabContent()}
    </Tabs>
  );
}
