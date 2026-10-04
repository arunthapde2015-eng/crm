import { BADGE_TONES, Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { AMC_STATUSES, AMC_STATUS_LABELS } from '../constants';
import {
  canRenew,
  getCurrentPeriod,
  getDaysRemaining,
  getReminderLabel,
  getRenewalToShow,
  getStatus,
  getUnpaidPeriod,
} from '../utils/amc';
import { AMC_STATUS_TONES } from './amcStatusTones';
import styles from './Amc.module.css';

const COLUMN_COUNT = 8;

const formatDate = (isoDate) => formatDayMonthYear(parseIsoDate(isoDate));

function getDaysClassName(status) {
  if (status === AMC_STATUSES.EXPIRED) return styles.daysExpired;
  if (status === AMC_STATUSES.EXPIRING_SOON) return styles.daysSoon;
  return '';
}

function RenewalCell({ renewal }) {
  if (!renewal) return '—';
  return (
    <>
      <Badge tone={renewal.isPaid ? BADGE_TONES.SUCCESS : BADGE_TONES.WARNING}>
        {renewal.isPaid ? 'Paid' : 'Pending'}
      </Badge>
      <span className={styles.subtext}>
        {formatCurrency(renewal.amount)} from {formatDate(renewal.start)}
      </span>
    </>
  );
}

/**
 * @param {object} props
 * @param {object[]} props.contracts - Already filtered and sorted.
 * @param {string} props.todayIso
 * @param {(contract: object) => void} props.onOpen - Opens the merchant's detail panel.
 * @param {(contract: object) => void} props.onRenew
 * @param {(contract: object, period: object) => void} props.onMarkPaid
 */
export function AmcTable({ contracts, todayIso, onOpen, onRenew, onMarkPaid }) {
  return (
    <DataTable caption="AMC contracts" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Merchant</th>
          <th scope="col">AMC period</th>
          <th scope="col" className={styles.numeric}>
            Days remaining
          </th>
          <th scope="col">Reminder</th>
          <th scope="col" className={styles.numeric}>
            Amount
          </th>
          <th scope="col">Renewal</th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {contracts.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No AMC contracts match these filters.
            </td>
          </tr>
        )}
        {contracts.map((contract) => {
          const current = getCurrentPeriod(contract, todayIso);
          const status = getStatus(contract, todayIso);
          const unpaid = getUnpaidPeriod(contract);
          return (
            <tr key={contract.id}>
              <th scope="row">
                <button
                  type="button"
                  className={styles.nameButton}
                  onClick={() => onOpen(contract)}
                >
                  {contract.merchantName}
                </button>
                <span className={styles.subtext}>
                  {contract.merchantCode}, onboarded {formatDate(contract.onboardedDate)}
                </span>
              </th>
              <td className={styles.nowrap}>
                {formatDate(current.start)} to {formatDate(current.end)}
              </td>
              <td className={`${styles.numeric} ${styles.days} ${getDaysClassName(status)}`}>
                {getDaysRemaining(contract, todayIso)}
              </td>
              <td>{getReminderLabel(contract, todayIso)}</td>
              <td className={styles.numeric}>{formatCurrency(current.amount)}</td>
              <td>
                <RenewalCell renewal={getRenewalToShow(contract, todayIso)} />
              </td>
              <td>
                <Badge tone={AMC_STATUS_TONES[status]}>{AMC_STATUS_LABELS[status]}</Badge>
              </td>
              <td className={styles.actions}>
                {canRenew(contract, todayIso) && (
                  <Button
                    variant="secondary"
                    aria-label={`Renew ${contract.merchantName}`}
                    onClick={() => onRenew(contract)}
                  >
                    Renew
                  </Button>
                )}
                {unpaid && (
                  <Button
                    variant="secondary"
                    aria-label={`Mark ${unpaid.invoiceNumber} paid`}
                    onClick={() => onMarkPaid(contract, unpaid)}
                  >
                    Mark paid
                  </Button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
