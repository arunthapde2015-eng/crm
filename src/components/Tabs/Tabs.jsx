import { useRef } from 'react';

import styles from './Tabs.module.css';

const KEY_OFFSETS = { ArrowRight: 1, ArrowLeft: -1 };

function getTabId(idPrefix, tabId) {
  return `${idPrefix}-tab-${tabId}`;
}

function getPanelId(idPrefix, tabId) {
  return `${idPrefix}-panel-${tabId}`;
}

/**
 * Accessible tab strip with a single panel for the active tab.
 * Arrow keys, Home and End move between tabs (automatic activation).
 *
 * @param {object} props
 * @param {{ id: string, label: string }[]} props.tabs - Tabs in display order.
 * @param {string} props.activeTabId - Id of the selected tab.
 * @param {(tabId: string) => void} props.onTabChange - Called with the newly selected tab id.
 * @param {string} props.label - Accessible name for the tab list.
 * @param {string} props.idPrefix - Unique prefix used to link tabs to the panel.
 * @param {React.ReactNode} props.children - Content of the active panel.
 */
export function Tabs({ tabs, activeTabId, onTabChange, label, idPrefix, children }) {
  const tabRefs = useRef(new Map());

  function selectTabAt(index) {
    const tab = tabs[(index + tabs.length) % tabs.length];
    onTabChange(tab.id);
    tabRefs.current.get(tab.id)?.focus();
  }

  function handleKeyDown(event) {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTabId);

    if (event.key in KEY_OFFSETS) {
      selectTabAt(activeIndex + KEY_OFFSETS[event.key]);
    } else if (event.key === 'Home') {
      selectTabAt(0);
    } else if (event.key === 'End') {
      selectTabAt(tabs.length - 1);
    } else {
      return;
    }
    event.preventDefault();
  }

  return (
    <>
      <div role="tablist" aria-label={label} className={styles.tablist}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                if (node) tabRefs.current.set(tab.id, node);
                else tabRefs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              id={getTabId(idPrefix, tab.id)}
              aria-selected={isActive}
              aria-controls={getPanelId(idPrefix, tab.id)}
              tabIndex={isActive ? 0 : -1}
              className={styles.tab}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={handleKeyDown}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={getPanelId(idPrefix, activeTabId)}
        aria-labelledby={getTabId(idPrefix, activeTabId)}
        className={styles.panel}
      >
        {children}
      </div>
    </>
  );
}
