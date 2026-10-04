import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { getTimelineEvents } from '../utils/merchantProfile';
import styles from './AmcDrawer.module.css';

/**
 * Onboarding, invoices, payments, remarks and changes, newest first.
 *
 * @param {object} props
 * @param {object} props.contract
 */
export function AmcTimelineTab({ contract }) {
  return (
    <ol className={styles.list}>
      {getTimelineEvents(contract).map((event) => (
        <li key={event.id}>
          {event.text}
          {event.amount > 0 && ` ${formatCurrency(event.amount)}`}
          <span className={styles.subtext}>
            {[formatDayMonthYear(parseIsoDate(event.date)), event.by].filter(Boolean).join(', ')}
          </span>
        </li>
      ))}
    </ol>
  );
}
