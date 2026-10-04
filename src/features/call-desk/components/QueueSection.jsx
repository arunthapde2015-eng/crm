import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';
import { formatMobile, getTelHref } from '@/utils/formatPhone';

import { getWhy, isOverdue } from '../utils/callDesk';
import styles from './CallDesk.module.css';

/**
 * One part of the call queue (call-backs, lead follow-ups, ...) as a table.
 *
 * @param {object} props
 * @param {{ id: string, title: string, items: object[] }} props.section
 * @param {string} props.todayIso
 * @param {(item: object) => void} props.onLogCall
 * @param {(item: object) => void} props.onOpen - Goes to the contact's page.
 */
export function QueueSection({ section, todayIso, onLogCall, onOpen }) {
  const headingId = `queue-${section.id}`;

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.sectionTitle}>
        {section.title} <span className={styles.count}>({section.items.length})</span>
      </h2>
      {section.items.length === 0 ? (
        <p className={styles.empty}>Nothing due.</p>
      ) : (
        <DataTable caption={section.title} tableClassName={styles.table}>
          <thead>
            <tr>
              <th scope="col">Who</th>
              <th scope="col">Phone</th>
              <th scope="col">Why</th>
              <th scope="col">Due</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {section.items.map((item) => (
              <tr key={item.id}>
                <th scope="row">
                  {item.name}
                  <span className={styles.subtext}>{item.kind}</span>
                </th>
                <td className={styles.nowrap}>
                  <a className={styles.link} href={getTelHref(item.phone)}>
                    {formatMobile(item.phone)}
                  </a>
                </td>
                <td>{getWhy(item, todayIso)}</td>
                <td
                  className={`${styles.nowrap} ${isOverdue(item, todayIso) ? styles.overdue : styles.upcoming}`}
                >
                  {formatDayMonthYear(parseIsoDate(item.due))}
                </td>
                <td className={styles.actions}>
                  <Button
                    aria-label={`Log call to ${item.name}, ${section.title}`}
                    onClick={() => onLogCall(item)}
                  >
                    Log call
                  </Button>
                  <Button
                    variant="secondary"
                    aria-label={`Open ${item.name}`}
                    onClick={() => onOpen(item)}
                  >
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </section>
  );
}
