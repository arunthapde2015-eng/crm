import { useId, useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Tabs } from '@/components/Tabs';
import { NAV_IDS } from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { toIsoDate } from '@/utils/formatDate';

import { OPEN_NAV_IDS, TAB_IDS } from '../constants';
import { useCallDesk } from '../hooks/useCallDesk';
import {
  applyCallToQueue,
  createEnquiry,
  createLogEntry,
  getEmptyCallValues,
  getEmptyEnquiryValues,
  getQueueSections,
  getSummary,
} from '../utils/callDesk';
import { CallForm } from './CallForm';
import { CallLogTable } from './CallLogTable';
import { EnquiryForm } from './EnquiryForm';
import { QueueSection } from './QueueSection';
import styles from './CallDesk.module.css';

// Which form is open: logging a call (for a queued item or ad hoc) or a new enquiry.
const FORMS = { CALL: 'call', ENQUIRY: 'enquiry' };

function formatSummary({ waiting, loggedToday, connectedToday }) {
  return `${waiting} ${waiting === 1 ? 'call' : 'calls'} waiting. ${loggedToday} logged by you today, ${connectedToday} connected.`;
}

/**
 * Who to call today and why, and a log of every call made or taken.
 *
 * @param {object} props
 * @param {(navId: string) => void} props.onNavigate - Opens a contact's page or support tickets.
 * @param {Date} [props.now] - Injectable for tests.
 */
export function CallDeskPanel({ onNavigate, now = new Date() }) {
  const { currentUser } = useAuth();
  const todayIso = toIsoDate(now);
  const { queue, callLog, logCall } = useCallDesk();
  const [activeTabId, setActiveTabId] = useState(TAB_IDS.QUEUE);
  const [openForm, setOpenForm] = useState(null);
  const [callingItem, setCallingItem] = useState(null);
  const tabIdPrefix = useId();

  function openCallForm(item) {
    setCallingItem(item);
    setOpenForm(FORMS.CALL);
  }

  function closeForm() {
    setOpenForm(null);
    setCallingItem(null);
  }

  function handleCallSubmit(values) {
    logCall(
      createLogEntry(values, now, currentUser.name),
      applyCallToQueue(queue, callingItem, values, todayIso),
    );
    closeForm();
  }

  function handleEnquirySubmit(values) {
    const { queueItem, logEntry } = createEnquiry(values, now, currentUser.name);
    logCall(logEntry, [...queue, queueItem]);
    closeForm();
  }

  return (
    <>
      <PageHeader
        title="Call desk"
        description={formatSummary(getSummary(queue, callLog, todayIso, currentUser.name))}
        actions={
          <>
            <Button onClick={() => openCallForm(null)}>Log a call</Button>
            <Button variant="secondary" onClick={() => setOpenForm(FORMS.ENQUIRY)}>
              New enquiry as lead
            </Button>
            <Button variant="secondary" onClick={() => onNavigate(NAV_IDS.SUPPORT_TICKETS)}>
              Raise ticket
            </Button>
          </>
        }
      />

      <div className={styles.body}>
        {openForm === FORMS.CALL && (
          <CallForm
            key={callingItem?.id ?? 'ad-hoc'}
            item={callingItem}
            initialValues={getEmptyCallValues(todayIso, callingItem)}
            todayIso={todayIso}
            onSubmit={handleCallSubmit}
            onCancel={closeForm}
          />
        )}
        {openForm === FORMS.ENQUIRY && (
          <EnquiryForm
            initialValues={getEmptyEnquiryValues()}
            onSubmit={handleEnquirySubmit}
            onCancel={closeForm}
          />
        )}

        <Tabs
          tabs={[
            { id: TAB_IDS.QUEUE, label: `Call queue (${queue.length})` },
            { id: TAB_IDS.LOG, label: 'Call log' },
          ]}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          label="Call desk"
          idPrefix={tabIdPrefix}
        >
          {activeTabId === TAB_IDS.LOG ? (
            <CallLogTable calls={callLog} />
          ) : (
            <div className={styles.body}>
              {getQueueSections(queue).map((section) => (
                <QueueSection
                  key={section.id}
                  section={section}
                  todayIso={todayIso}
                  onLogCall={openCallForm}
                  onOpen={(item) => onNavigate(OPEN_NAV_IDS[item.kind])}
                />
              ))}
            </div>
          )}
        </Tabs>
      </div>
    </>
  );
}
