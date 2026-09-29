import { useState } from 'react';

import { Tabs } from '@/components/Tabs';

import { DEFAULT_SETTINGS_TAB_ID, SETTINGS_TAB_IDS, SETTINGS_TABS } from '../constants';
import { DocumentSettingsForm } from './DocumentSettingsForm';
import styles from './SettingsPanel.module.css';

function renderTabContent(tabId) {
  if (tabId === SETTINGS_TAB_IDS.DOCUMENTS) return <DocumentSettingsForm />;

  const tabLabel = SETTINGS_TABS.find((tab) => tab.id === tabId)?.label;
  return <p className={styles.empty}>{tabLabel} settings are not available yet.</p>;
}

export function SettingsPanel({ initialTabId = DEFAULT_SETTINGS_TAB_ID }) {
  const [activeTabId, setActiveTabId] = useState(initialTabId);

  return (
    <Tabs
      tabs={SETTINGS_TABS}
      activeTabId={activeTabId}
      onTabChange={setActiveTabId}
      label="Settings sections"
      idPrefix="settings"
    >
      {renderTabContent(activeTabId)}
    </Tabs>
  );
}
