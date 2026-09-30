import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';
import { formatMobile } from '@/utils/formatPhone';

import { FOLLOW_UP_STATES } from '../constants';
import { getFollowUpState } from '../utils/leadQueries';
import { PriorityBadge, StatusBadge } from './LeadBadge';
import { ReassignControl } from './ReassignControl';
import styles from './LeadsTable.module.css';

const FOLLOW_UP_CLASS_NAMES = {
  [FOLLOW_UP_STATES.OVERDUE]: styles.overdue,
  [FOLLOW_UP_STATES.TODAY]: styles.dueToday,
  [FOLLOW_UP_STATES.UPCOMING]: '',
};

const FOLLOW_UP_NOTES = {
  [FOLLOW_UP_STATES.OVERDUE]: '(overdue)',
  [FOLLOW_UP_STATES.TODAY]: '(today)',
  [FOLLOW_UP_STATES.UPCOMING]: '',
};

function FollowUpCell({ isoDate, todayIsoDate }) {
  if (!isoDate) {
    return (
      <>
        <span aria-hidden="true">—</span>
        <span className="visually-hidden">None</span>
      </>
    );
  }

  const state = getFollowUpState(isoDate, todayIsoDate);
  const note = FOLLOW_UP_NOTES[state];
  // The separating space sits outside the hidden span; some name algorithms trim inside it.
  return (
    <span className={FOLLOW_UP_CLASS_NAMES[state]}>
      {formatDayMonthYear(parseIsoDate(isoDate))}
      {note && (
        <>
          {' '}
          <span className="visually-hidden">{note}</span>
        </>
      )}
    </span>
  );
}

/**
 * @param {object} props
 * @param {object} props.lead
 * @param {string | undefined} props.salespersonName - Undefined when unassigned.
 * @param {string} props.todayIsoDate
 * @param {boolean} props.isSelected
 * @param {boolean} props.isReassigning
 * @param {() => void} props.onToggleSelect
 * @param {() => void} props.onReassignStart
 * @param {() => void} props.onReassignEnd
 * @param {(salespersonId: string | null) => void} props.onAssign
 */
export function LeadRow({
  lead,
  salespersonName,
  todayIsoDate,
  isSelected,
  isReassigning,
  onToggleSelect,
  onReassignStart,
  onReassignEnd,
  onAssign,
}) {
  function handleAssign(salespersonId) {
    onAssign(salespersonId);
    onReassignEnd();
  }

  return (
    <tr className={isSelected ? styles.selectedRow : undefined}>
      <td className={styles.checkboxCell}>
        <input
          type="checkbox"
          aria-label={`Select ${lead.name}`}
          checked={isSelected}
          onChange={onToggleSelect}
        />
      </td>
      <th scope="row" className={styles.leadCell}>
        <span className={styles.leadName}>{lead.name}</span>
        <span className={styles.leadMeta}>
          {lead.number}, {lead.contactName}
        </span>
      </th>
      <td className={styles.nowrap}>{formatMobile(lead.mobile)}</td>
      <td>{lead.source}</td>
      <td>{lead.product}</td>
      <td className={styles.numeric}>{formatCurrency(lead.value)}</td>
      <td className={styles.nowrap}>
        <FollowUpCell isoDate={lead.nextFollowUp} todayIsoDate={todayIsoDate} />
      </td>
      <td>{salespersonName ?? <span className={styles.unassigned}>Unassigned</span>}</td>
      <td>
        <PriorityBadge priority={lead.priority} />
      </td>
      <td>
        <StatusBadge status={lead.status} />
      </td>
      <td className={styles.actionCell}>
        {isReassigning ? (
          <ReassignControl lead={lead} onAssign={handleAssign} onCancel={onReassignEnd} />
        ) : (
          <button
            type="button"
            className={styles.linkButton}
            aria-label={`Reassign ${lead.name}`}
            onClick={onReassignStart}
          >
            Reassign
          </button>
        )}
      </td>
    </tr>
  );
}
