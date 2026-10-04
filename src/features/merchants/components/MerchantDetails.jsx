import { useId, useState } from 'react';

import { LifecycleStepper } from '@/components/LifecycleStepper';
import { Tabs } from '@/components/Tabs';
import { formatMobile } from '@/utils/formatPhone';

import { DETAIL_TAB_IDS } from '../constants';
import { getAccountSummary, getLifecycleStages } from '../utils/merchantDetails';
import { MerchantAccountSummary } from './MerchantAccountSummary';
import { MerchantActions } from './MerchantActions';
import { MerchantOutlets } from './MerchantOutlets';
import { MerchantOverview } from './MerchantOverview';
import { MerchantTimeline } from './MerchantTimeline';
import styles from './MerchantDetails.module.css';

function getTabs(merchant) {
  return [
    { id: DETAIL_TAB_IDS.OVERVIEW, label: 'Overview' },
    { id: DETAIL_TAB_IDS.SALES, label: 'Sales' },
    { id: DETAIL_TAB_IDS.PAYMENTS, label: 'Payments' },
    { id: DETAIL_TAB_IDS.OUTLETS, label: `Outlets (${merchant.outlets.length})` },
    { id: DETAIL_TAB_IDS.LEDGER, label: 'Ledger' },
    { id: DETAIL_TAB_IDS.TIMELINE, label: 'Timeline' },
    { id: DETAIL_TAB_IDS.DOCUMENTS, label: 'Documents' },
  ];
}

/**
 * Everything about one merchant, shown inside the detail drawer.
 *
 * @param {object} props
 * @param {object} props.merchant
 * @param {string} props.headingId - Id for the name heading, which labels the drawer.
 * @param {() => void} props.onClose
 * @param {{ onNewQuotation, onNewInvoice, onEdit, onCopy, onToggleStatus, onDelete, onAddOutlet, onAddRemark }} props.handlers
 */
export function MerchantDetails({ merchant, headingId, onClose, handlers }) {
  const [activeTabId, setActiveTabId] = useState(DETAIL_TAB_IDS.OVERVIEW);
  // Which quick-add form is open: 'outlet', 'remark' or null.
  const [openForm, setOpenForm] = useState(null);
  const tabIdPrefix = useId();
  const account = getAccountSummary(merchant);
  const { invoices = 0, receipts = 0 } = merchant.linkedRecords;

  function openTabWithForm(tabId, form) {
    setActiveTabId(tabId);
    setOpenForm(form);
  }

  function renderTabContent() {
    switch (activeTabId) {
      case DETAIL_TAB_IDS.SALES:
        return (
          <MerchantAccountSummary
            items={[
              { label: 'Invoices', count: invoices },
              { label: 'Total sales', amount: account.invoiced },
              { label: 'Outstanding', amount: account.outstanding },
            ]}
          />
        );
      case DETAIL_TAB_IDS.PAYMENTS:
        return (
          <MerchantAccountSummary
            items={[
              { label: 'Receipts', count: receipts },
              { label: 'Received', amount: account.received },
            ]}
          />
        );
      case DETAIL_TAB_IDS.OUTLETS:
        return (
          <MerchantOutlets
            merchant={merchant}
            isFormOpen={openForm === 'outlet'}
            onAdd={(outletName) => {
              handlers.onAddOutlet(outletName);
              setOpenForm(null);
            }}
            onCancel={() => setOpenForm(null)}
          />
        );
      case DETAIL_TAB_IDS.LEDGER:
        return (
          <MerchantAccountSummary
            items={[
              { label: 'Invoiced', amount: account.invoiced },
              { label: 'Received', amount: account.received },
              { label: 'Balance due', amount: account.outstanding },
            ]}
          />
        );
      case DETAIL_TAB_IDS.TIMELINE:
        return (
          <MerchantTimeline
            merchant={merchant}
            isFormOpen={openForm === 'remark'}
            onAddRemark={(text) => {
              handlers.onAddRemark(text);
              setOpenForm(null);
            }}
            onCancel={() => setOpenForm(null)}
          />
        );
      case DETAIL_TAB_IDS.DOCUMENTS:
        return <p className={styles.empty}>No documents uploaded yet.</p>;
      default:
        return <MerchantOverview merchant={merchant} />;
    }
  }

  return (
    <>
      <header className={styles.header}>
        <div>
          <h2 id={headingId} className={styles.title}>
            {merchant.name}
          </h2>
          <p className={styles.subtitle}>
            {[merchant.number, merchant.contactName, formatMobile(merchant.mobile)]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close details"
          onClick={onClose}
        >
          <span aria-hidden="true">✕</span>
        </button>
      </header>

      <div className={styles.section}>
        <LifecycleStepper stages={getLifecycleStages(merchant)} />
      </div>
      <div className={styles.section}>
        <MerchantActions
          merchant={merchant}
          onNewQuotation={handlers.onNewQuotation}
          onNewInvoice={handlers.onNewInvoice}
          onAddOutlet={() => openTabWithForm(DETAIL_TAB_IDS.OUTLETS, 'outlet')}
          onAddRemark={() => openTabWithForm(DETAIL_TAB_IDS.TIMELINE, 'remark')}
          onStatement={() => openTabWithForm(DETAIL_TAB_IDS.LEDGER, null)}
          onEdit={handlers.onEdit}
          onCopy={handlers.onCopy}
          onToggleStatus={handlers.onToggleStatus}
          onDelete={handlers.onDelete}
        />
      </div>
      <div className={styles.section}>
        <Tabs
          tabs={getTabs(merchant)}
          activeTabId={activeTabId}
          onTabChange={(tabId) => openTabWithForm(tabId, null)}
          label="Merchant details"
          idPrefix={tabIdPrefix}
        >
          {renderTabContent()}
        </Tabs>
      </div>
    </>
  );
}
