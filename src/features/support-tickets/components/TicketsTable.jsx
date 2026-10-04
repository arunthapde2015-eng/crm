import { Badge } from '@/components/Badge';
import { DataTable } from '@/components/DataTable';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { PRIORITY_LABELS, TICKET_STATUS_LABELS } from '../constants';
import { getAssigneeName, isPastDue } from '../utils/tickets';
import { PRIORITY_TONES, STATUS_TONES } from './ticketOptions';
import styles from './Tickets.module.css';

const COLUMN_COUNT = 7;
const formatDate = (isoDate) => formatDayMonthYear(parseIsoDate(isoDate));

/**
 * @param {object} props
 * @param {object[]} props.tickets - Already filtered and sorted.
 * @param {string} props.todayIso
 * @param {(ticket: object) => void} props.onOpen
 */
export function TicketsTable({ tickets, todayIso, onOpen }) {
  return (
    <DataTable caption="Support tickets" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Ticket</th>
          <th scope="col">Subject</th>
          <th scope="col">Category</th>
          <th scope="col">Priority</th>
          <th scope="col">Assigned to</th>
          <th scope="col">Due</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {tickets.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No tickets match these filters.
            </td>
          </tr>
        )}
        {tickets.map((ticket) => {
          const pastDue = isPastDue(ticket, todayIso);
          return (
            <tr key={ticket.id}>
              <th scope="row">
                <button type="button" className={styles.linkButton} onClick={() => onOpen(ticket)}>
                  {ticket.number}
                </button>
                <span className={styles.subtext}>{formatDate(ticket.raisedOn)}</span>
              </th>
              <td>
                {ticket.subject}
                <span className={styles.subtext}>{ticket.customer}</span>
              </td>
              <td>{ticket.category}</td>
              <td>
                <Badge tone={PRIORITY_TONES[ticket.priority]}>
                  {PRIORITY_LABELS[ticket.priority]}
                </Badge>
              </td>
              <td>{getAssigneeName(ticket)}</td>
              <td className={styles.nowrap}>
                <span className={pastDue ? styles.overdue : undefined}>
                  {formatDate(ticket.due)}
                </span>
                {pastDue && <span className={styles.subtext}>Overdue</span>}
              </td>
              <td>
                <Badge tone={STATUS_TONES[ticket.status]}>
                  {TICKET_STATUS_LABELS[ticket.status]}
                </Badge>
              </td>
            </tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
