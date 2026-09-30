import { SALESPERSON_NAMES } from '@/constants/team';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';
import { formatMobile, getTelHref } from '@/utils/formatPhone';

import { FOLLOW_UP_TYPE_LABELS } from '../constants';
import { LogFollowUpForm } from './LogFollowUpForm';
import styles from './FollowUpTable.module.css';

/**
 * A follow-up row, plus a second row holding the log form while it is open.
 *
 * @param {object} props
 * @param {object} props.followUp
 * @param {boolean} props.isOverdue
 * @param {boolean} props.isLogging
 * @param {string} props.defaultNextDate
 * @param {number} props.columnCount - Used to span the form row across the table.
 * @param {() => void} props.onLogStart
 * @param {() => void} props.onLogEnd
 * @param {(log: object) => void} props.onLog
 */
export function FollowUpRow({
  followUp,
  isOverdue,
  isLogging,
  defaultNextDate,
  columnCount,
  onLogStart,
  onLogEnd,
  onLog,
}) {
  function handleLogSubmit(log) {
    onLog(log);
    onLogEnd();
  }

  return (
    <>
      <tr>
        <th scope="row" className={styles.leadCell}>
          <span className={styles.primary}>{followUp.leadName}</span>
          <span className={styles.secondary}>
            {followUp.contactName}, {formatMobile(followUp.mobile)}
          </span>
        </th>
        <td className={styles.nowrap}>
          <span className={isOverdue ? styles.overdue : styles.primary}>
            {formatDayMonthYear(parseIsoDate(followUp.dueDate))}
          </span>
          <span className={styles.secondary}>{followUp.dueTime}</span>
        </td>
        <td>{FOLLOW_UP_TYPE_LABELS[followUp.type]}</td>
        <td>{followUp.lastDiscussion}</td>
        <td>{SALESPERSON_NAMES.get(followUp.ownerId) ?? 'Unassigned'}</td>
        <td className={styles.actionsCell}>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionButton}
              aria-expanded={isLogging}
              onClick={isLogging ? onLogEnd : onLogStart}
            >
              Log follow-up <span className="visually-hidden">for {followUp.leadName}</span>
            </button>
            <a className={styles.callLink} href={getTelHref(followUp.mobile)}>
              Call <span className="visually-hidden">{followUp.contactName}</span>
            </a>
          </div>
        </td>
      </tr>
      {isLogging && (
        <tr className={styles.formRow}>
          <td colSpan={columnCount}>
            <LogFollowUpForm
              followUp={followUp}
              defaultNextDate={defaultNextDate}
              onSubmit={handleLogSubmit}
              onCancel={onLogEnd}
            />
          </td>
        </tr>
      )}
    </>
  );
}
