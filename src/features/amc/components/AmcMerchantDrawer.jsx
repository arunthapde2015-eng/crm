import { useId, useState } from 'react';

import { BADGE_TONES, Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { InlineTextForm } from '@/components/InlineTextForm';
import { LifecycleStepper } from '@/components/LifecycleStepper';
import { Tabs } from '@/components/Tabs';
import { formatMobile } from '@/utils/formatPhone';

import {
  DETAIL_TABS,
  DETAIL_TAB_IDS,
  MAX_REMARK_LENGTH,
  MERCHANT_STATUSES,
  MERCHANT_STATUS_LABELS,
} from '../constants';
import { canRenew, getRenewalFormValues } from '../utils/amc';
import {
  getLifecycleStages,
  getProfileFormValues,
  toProfileChanges,
} from '../utils/merchantProfile';
import { AmcDocumentsTab } from './AmcDocumentsTab';
import { AmcHistoryTab } from './AmcHistoryTab';
import { AmcLedgerTab } from './AmcLedgerTab';
import { AmcOverviewTab } from './AmcOverviewTab';
import { AmcPaymentsTab } from './AmcPaymentsTab';
import { AmcSalesTab } from './AmcSalesTab';
import { AmcTimelineTab } from './AmcTimelineTab';
import { ProfileForm } from './ProfileForm';
import { RenewalForm } from './RenewalForm';
import { StatusForm } from './StatusForm';
import styles from './AmcDrawer.module.css';

const PANELS = { RENEW: 'renew', STATUS: 'status', REMARK: 'remark', EDIT: 'edit' };
const REMARK_ROWS = 3;

function TabContent({ tabId, contract, todayIso, onOpenCustomer }) {
  switch (tabId) {
    case DETAIL_TAB_IDS.AMC:
      return <AmcHistoryTab contract={contract} todayIso={todayIso} />;
    case DETAIL_TAB_IDS.SALES:
      return <AmcSalesTab contract={contract} />;
    case DETAIL_TAB_IDS.PAYMENTS:
      return <AmcPaymentsTab contract={contract} />;
    case DETAIL_TAB_IDS.LEDGER:
      return <AmcLedgerTab contract={contract} />;
    case DETAIL_TAB_IDS.TIMELINE:
      return <AmcTimelineTab contract={contract} />;
    case DETAIL_TAB_IDS.DOCUMENTS:
      return <AmcDocumentsTab contract={contract} />;
    default:
      return (
        <AmcOverviewTab contract={contract} todayIso={todayIso} onOpenCustomer={onOpenCustomer} />
      );
  }
}

/**
 * Side panel for one merchant outlet on the AMC page: lifecycle, quick actions and tabs.
 *
 * @param {object} props
 * @param {object} props.contract
 * @param {string} props.todayIso
 * @param {(values: object) => void} props.onRenew - Raises the renewal invoice.
 * @param {(changes: object, note: string, isRemark?: boolean) => void} props.onUpdate
 *   Applies changes (may be empty) and logs the note on the timeline.
 * @param {() => void} props.onNewQuotation
 * @param {() => void} props.onOpenCustomer
 * @param {() => void} props.onClose
 */
export function AmcMerchantDrawer({
  contract,
  todayIso,
  onRenew,
  onUpdate,
  onNewQuotation,
  onOpenCustomer,
  onClose,
}) {
  const headingId = useId();
  const tabIdPrefix = useId();
  const [activeTabId, setActiveTabId] = useState(DETAIL_TAB_IDS.OVERVIEW);
  const [openPanel, setOpenPanel] = useState(null);
  const isActive = contract.status === MERCHANT_STATUSES.ACTIVE;
  const isRenewable = isActive && canRenew(contract, todayIso);
  const closePanel = () => setOpenPanel(null);

  function togglePanel(panel) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  function renderPanel() {
    switch (openPanel) {
      case PANELS.RENEW:
        return (
          <RenewalForm
            contract={contract}
            initialValues={getRenewalFormValues(contract, todayIso)}
            todayIso={todayIso}
            onSubmit={(values) => {
              onRenew(values);
              closePanel();
              setActiveTabId(DETAIL_TAB_IDS.AMC);
            }}
            onCancel={closePanel}
          />
        );
      case PANELS.STATUS:
        return (
          <StatusForm
            currentStatus={contract.status}
            onSubmit={(status) => {
              onUpdate({ status }, `Merchant status changed to ${MERCHANT_STATUS_LABELS[status]}.`);
              closePanel();
            }}
            onCancel={closePanel}
          />
        );
      case PANELS.REMARK:
        return (
          <InlineTextForm
            id="amc-remark"
            label="Remark"
            submitLabel="Save remark"
            rows={REMARK_ROWS}
            maxLength={MAX_REMARK_LENGTH}
            onSubmit={(text) => {
              onUpdate({}, text, true);
              closePanel();
            }}
            onCancel={closePanel}
          />
        );
      case PANELS.EDIT:
        return (
          <ProfileForm
            initialValues={getProfileFormValues(contract)}
            onSubmit={(values) => {
              onUpdate(toProfileChanges(values), 'Merchant details updated.');
              closePanel();
            }}
            onCancel={closePanel}
          />
        );
      default:
        return null;
    }
  }

  return (
    <Drawer labelledBy={headingId} onClose={onClose}>
      <header className={styles.header}>
        <div>
          <h2 id={headingId} className={styles.title}>
            {contract.merchantName}
          </h2>
          <p className={styles.subtitle}>
            {contract.merchantCode}, {contract.contactName}, {formatMobile(contract.mobile)}
          </p>
        </div>
        <div className={styles.headerEnd}>
          <Badge tone={isActive ? BADGE_TONES.SUCCESS : BADGE_TONES.NEUTRAL}>
            {MERCHANT_STATUS_LABELS[contract.status]}
          </Badge>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close details"
            onClick={onClose}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </header>

      <div className={styles.section}>
        <LifecycleStepper stages={getLifecycleStages(contract, todayIso)} />
      </div>

      <div className={styles.section}>
        <div className={styles.actions}>
          <Button onClick={() => togglePanel(PANELS.RENEW)} disabled={!isRenewable}>
            Renew AMC
          </Button>
          <Button variant="secondary" onClick={() => togglePanel(PANELS.STATUS)}>
            Change status
          </Button>
          <Button variant="secondary" onClick={onNewQuotation} disabled={!isActive}>
            New quotation
          </Button>
          <Button variant="secondary" onClick={() => togglePanel(PANELS.REMARK)}>
            Add remark
          </Button>
          <Button variant="secondary" onClick={() => togglePanel(PANELS.EDIT)}>
            Edit
          </Button>
        </div>
        {!isActive && (
          <p className={styles.hint}>
            {MERCHANT_STATUS_LABELS[contract.status]}: set the status back to Active to renew the
            AMC or raise a quotation.
          </p>
        )}
      </div>

      {openPanel && <div className={styles.section}>{renderPanel()}</div>}

      <div className={styles.section}>
        <Tabs
          tabs={DETAIL_TABS}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          label="Merchant details"
          idPrefix={tabIdPrefix}
        >
          <TabContent
            tabId={activeTabId}
            contract={contract}
            todayIso={todayIso}
            onOpenCustomer={onOpenCustomer}
          />
        </Tabs>
      </div>
    </Drawer>
  );
}
