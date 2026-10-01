import { useId } from 'react';

import { DataTable } from '@/components/DataTable';

import { FOLLOW_UP_GROUP_IDS } from '../constants';
import { FollowUpRow } from './FollowUpRow';
import styles from './FollowUpTable.module.css';

const COLUMN_COUNT = 6;

/**
 * One dated section (Overdue, Today, ...) with its follow-ups in a table.
 *
 * @param {object} props
 * @param {{ id: string, label: string, followUps: object[] }} props.group
 * @param {string | null} props.loggingFollowUpId - Row whose log form is open, if any.
 * @param {string} props.defaultNextDate
 * @param {(followUpId: string | null) => void} props.onLoggingChange
 * @param {(followUpId: string, log: object) => void} props.onLog
 */
export function FollowUpGroup({
  group,
  loggingFollowUpId,
  defaultNextDate,
  onLoggingChange,
  onLog,
}) {
  const headingId = useId();
  const isOverdue = group.id === FOLLOW_UP_GROUP_IDS.OVERDUE;

  return (
    <section className={styles.group} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.groupTitle}>
        {group.label} <span className={styles.groupCount}>({group.followUps.length})</span>
      </h2>
      <DataTable
        caption={`${group.label} follow-ups`}
        className={styles.scroller}
        tableClassName={styles.table}
      >
        <thead>
          <tr>
            <th scope="col">Lead</th>
            <th scope="col">When</th>
            <th scope="col">Type</th>
            <th scope="col">Last discussion</th>
            <th scope="col">Owner</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {group.followUps.map((followUp) => (
            <FollowUpRow
              key={followUp.id}
              followUp={followUp}
              isOverdue={isOverdue}
              isLogging={loggingFollowUpId === followUp.id}
              defaultNextDate={defaultNextDate}
              columnCount={COLUMN_COUNT}
              onLogStart={() => onLoggingChange(followUp.id)}
              onLogEnd={() => onLoggingChange(null)}
              onLog={(log) => onLog(followUp.id, log)}
            />
          ))}
        </tbody>
      </DataTable>
    </section>
  );
}
