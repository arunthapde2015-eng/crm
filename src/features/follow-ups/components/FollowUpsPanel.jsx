import { useState } from 'react';

import { PageHeader } from '@/components/PageHeader';
import { addDays, toIsoDate } from '@/utils/formatDate';

import { useFollowUps } from '../hooks/useFollowUps';
import { getFollowUpSummary, groupFollowUps } from '../utils/followUps';
import { FollowUpGroup } from './FollowUpGroup';
import styles from './FollowUpsPanel.module.css';

/**
 * @param {object} props
 * @param {Date} [props.today] - Reference date for grouping; injectable for tests.
 */
export function FollowUpsPanel({ today = new Date() }) {
  const { followUps, logFollowUp } = useFollowUps();
  const [loggingFollowUpId, setLoggingFollowUpId] = useState(null);

  const groups = groupFollowUps(followUps, today);
  const nonEmptyGroups = groups.filter((group) => group.followUps.length > 0);
  const defaultNextDate = toIsoDate(addDays(today, 1));

  return (
    <>
      <PageHeader title="Follow-ups" description={getFollowUpSummary(groups)} />
      {nonEmptyGroups.length === 0 ? (
        <p className={styles.empty}>No follow-ups scheduled.</p>
      ) : (
        <div className={styles.groups}>
          {nonEmptyGroups.map((group) => (
            <FollowUpGroup
              key={group.id}
              group={group}
              loggingFollowUpId={loggingFollowUpId}
              defaultNextDate={defaultNextDate}
              onLoggingChange={setLoggingFollowUpId}
              onLog={logFollowUp}
            />
          ))}
        </div>
      )}
    </>
  );
}
