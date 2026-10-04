import { useId, useState } from 'react';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';
import { formatMobile, getTelHref } from '@/utils/formatPhone';

import {
  MAX_TEXT_LENGTH,
  PRIORITY_LABELS,
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
} from '../constants';
import { getAssigneeName, getUpdateFormValues, isPastDue, validateUpdate } from '../utils/tickets';
import { ASSIGNEE_OPTIONS, PRIORITY_TONES, STATUS_TONES } from './ticketOptions';
import styles from './Tickets.module.css';

const STATUS_OPTIONS = Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const NOTE_ROWS = 3;
const formatDate = (isoDate) => formatDayMonthYear(parseIsoDate(isoDate));

function UpdateForm({ ticket, onSubmit }) {
  const [values, setValues] = useState(() => getUpdateFormValues(ticket));
  const [errors, setErrors] = useState([]);
  const isResolving =
    values.status === TICKET_STATUSES.RESOLVED && ticket.status !== TICKET_STATUSES.RESOLVED;

  function getFieldProps(name) {
    return {
      id: `ticket-update-${name}`,
      name,
      value: values[name],
      onChange: (event) => {
        setValues((previous) => ({ ...previous, [name]: event.target.value }));
        setErrors([]);
      },
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateUpdate(values, ticket);
    setErrors(validationErrors);
    // On success the drawer remounts this form (keyed by the update count), clearing the note.
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="ticket-update-title">
      <h3 id="ticket-update-title" className={styles.formTitle}>
        Update ticket
      </h3>
      <div className={styles.grid}>
        <SelectField label="Status" options={STATUS_OPTIONS} {...getFieldProps('status')} />
        <SelectField
          label="Assigned to"
          options={ASSIGNEE_OPTIONS}
          {...getFieldProps('assigneeId')}
        />
      </div>
      <TextField
        label={isResolving ? 'How was it resolved?' : 'Note (optional)'}
        rows={NOTE_ROWS}
        maxLength={MAX_TEXT_LENGTH}
        {...getFieldProps('note')}
      />
      {errors.length > 0 && (
        <ul className={styles.errors} role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <div className={styles.formActions}>
        <Button type="submit">Save update</Button>
      </div>
    </form>
  );
}

/**
 * One ticket: the problem, its history, and a form to move it along.
 *
 * @param {object} props
 * @param {object} props.ticket
 * @param {string} props.todayIso
 * @param {(values: object) => void} props.onUpdate
 * @param {() => void} props.onClose
 */
export function TicketDrawer({ ticket, todayIso, onUpdate, onClose }) {
  const headingId = useId();
  const pastDue = isPastDue(ticket, todayIso);
  const details = [
    { label: 'Category', value: ticket.category },
    {
      label: 'Priority',
      value: (
        <Badge tone={PRIORITY_TONES[ticket.priority]}>{PRIORITY_LABELS[ticket.priority]}</Badge>
      ),
    },
    { label: 'Assigned to', value: getAssigneeName(ticket) },
    { label: 'Raised', value: formatDate(ticket.raisedOn) },
    { label: 'Due', value: `${formatDate(ticket.due)}${pastDue ? ', overdue' : ''}` },
    {
      label: 'Phone',
      value: ticket.phone ? (
        <a className={styles.link} href={getTelHref(ticket.phone)}>
          {formatMobile(ticket.phone)}
        </a>
      ) : (
        '—'
      ),
    },
  ];

  return (
    <Drawer labelledBy={headingId} onClose={onClose}>
      <header className={styles.drawerHeader}>
        <div>
          <h2 id={headingId} className={styles.drawerTitle}>
            {ticket.number}: {ticket.subject}
          </h2>
          <p className={styles.drawerSubtitle}>{ticket.customer}</p>
        </div>
        <div className={styles.drawerHeaderEnd}>
          <Badge tone={STATUS_TONES[ticket.status]}>{TICKET_STATUS_LABELS[ticket.status]}</Badge>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close ticket"
            onClick={onClose}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </header>

      <div className={styles.stack}>
        <p className={styles.description}>{ticket.description}</p>
        <dl className={styles.details}>
          {details.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="ticket-history-title">
          <h3 id="ticket-history-title" className={styles.sectionTitle}>
            History
          </h3>
          <ol className={styles.history}>
            {[...ticket.updates].reverse().map((update) => (
              <li key={update.id}>
                {update.note}
                <span className={styles.subtext}>
                  {formatDate(update.date)}, {update.by}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <UpdateForm key={ticket.updates.length} ticket={ticket} onSubmit={onUpdate} />
      </div>
    </Drawer>
  );
}
