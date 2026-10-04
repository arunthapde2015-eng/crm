import { DataTable } from '@/components/DataTable';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';
import { formatMobile, getTelHref } from '@/utils/formatPhone';

import { CALL_OUTCOME_LABELS } from '../constants';
import styles from './CallDesk.module.css';

const COLUMN_COUNT = 6;

/** "2026-09-27T11:05" → "27-09-2026, 11:05" */
function formatLogTime(at) {
  const [date, time] = at.split('T');
  return `${formatDayMonthYear(parseIsoDate(date))}, ${time}`;
}

/**
 * Every logged call, newest first.
 *
 * @param {object} props
 * @param {object[]} props.calls
 */
export function CallLogTable({ calls }) {
  return (
    <DataTable caption="Call log" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">When</th>
          <th scope="col">Who</th>
          <th scope="col">Direction</th>
          <th scope="col">Outcome</th>
          <th scope="col">Notes</th>
          <th scope="col">By</th>
        </tr>
      </thead>
      <tbody>
        {calls.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No calls logged yet.
            </td>
          </tr>
        )}
        {calls.map((call) => (
          <tr key={call.id}>
            <td className={styles.nowrap}>{formatLogTime(call.at)}</td>
            <th scope="row">
              {call.name}
              <a className={`${styles.link} ${styles.subtext}`} href={getTelHref(call.phone)}>
                {formatMobile(call.phone)}
              </a>
            </th>
            <td>{call.direction}</td>
            <td>{CALL_OUTCOME_LABELS[call.outcome]}</td>
            <td>{call.notes || '—'}</td>
            <td>{call.by}</td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
