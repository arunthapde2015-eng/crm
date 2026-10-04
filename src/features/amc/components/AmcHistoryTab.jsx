import { BADGE_TONES, Badge } from '@/components/Badge';
import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { withGst } from '../utils/amc';
import { getReminderSchedule } from '../utils/merchantProfile';
import styles from './AmcDrawer.module.css';

const formatDate = (isoDate) => formatDayMonthYear(parseIsoDate(isoDate));

/**
 * Every AMC year billed to this outlet, and the reminder schedule for the current one.
 *
 * @param {object} props
 * @param {object} props.contract
 * @param {string} props.todayIso
 */
export function AmcHistoryTab({ contract, todayIso }) {
  const periods = [...contract.periods].reverse();

  return (
    <div className={styles.stack}>
      <section aria-labelledby="amc-history-title">
        <h3 id="amc-history-title" className={styles.sectionTitle}>
          AMC years
        </h3>
        <DataTable caption="AMC years" tableClassName={styles.table}>
          <thead>
            <tr>
              <th scope="col">Invoice</th>
              <th scope="col">Period</th>
              <th scope="col" className={styles.numeric}>
                Amount
              </th>
              <th scope="col" className={styles.numeric}>
                With GST
              </th>
              <th scope="col">Payment</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period.invoiceNumber}>
                <th scope="row">
                  {period.invoiceNumber}
                  <span className={styles.subtext}>Raised {formatDate(period.invoiceDate)}</span>
                </th>
                <td className={styles.nowrap}>
                  {formatDate(period.start)} to {formatDate(period.end)}
                </td>
                <td className={styles.numeric}>{formatCurrency(period.amount)}</td>
                <td className={styles.numeric}>{formatCurrency(withGst(period.amount))}</td>
                <td>
                  <Badge tone={period.isPaid ? BADGE_TONES.SUCCESS : BADGE_TONES.WARNING}>
                    {period.isPaid ? 'Paid' : 'Pending'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>

      <section aria-labelledby="amc-reminders-title">
        <h3 id="amc-reminders-title" className={styles.sectionTitle}>
          Reminders for the current year
        </h3>
        <ul className={styles.list}>
          {getReminderSchedule(contract, todayIso).map((reminder) => (
            <li key={reminder.id} className={styles.listRow}>
              <span>
                {reminder.label}
                <span className={styles.subtext}>{formatDate(reminder.date)}</span>
              </span>
              <Badge tone={reminder.isSent ? BADGE_TONES.NEUTRAL : BADGE_TONES.INFO}>
                {reminder.isSent ? 'Sent' : 'Scheduled'}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
