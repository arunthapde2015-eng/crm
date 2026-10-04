import { BADGE_TONES, Badge } from '@/components/Badge';
import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { VOUCHER_STATUSES, VOUCHER_TYPE_DETAILS } from '../constants';
import { getAccountNames, getVoucherTotal } from '../utils/vouchers';
import styles from './Accounting.module.css';

const COLUMN_COUNT = 6;

/**
 * @param {object} props
 * @param {object[]} props.vouchers - Already filtered and sorted.
 * @param {object[]} props.accounts
 * @param {(voucher: object) => void} props.onOpen
 */
export function VouchersTable({ vouchers, accounts, onOpen }) {
  return (
    <DataTable caption="Vouchers" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Voucher</th>
          <th scope="col">Date</th>
          <th scope="col">Type</th>
          <th scope="col">Narration</th>
          <th scope="col">Accounts</th>
          <th scope="col" className={styles.numeric}>
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {vouchers.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No vouchers match these filters.
            </td>
          </tr>
        )}
        {vouchers.map((voucher) => {
          const isCancelled = voucher.status === VOUCHER_STATUSES.CANCELLED;
          return (
            <tr key={voucher.id} className={isCancelled ? styles.voidRow : undefined}>
              <th scope="row">
                <button type="button" className={styles.linkButton} onClick={() => onOpen(voucher)}>
                  {voucher.number}
                </button>
                {isCancelled && (
                  <span className={styles.block}>
                    <Badge tone={BADGE_TONES.DANGER}>Cancelled</Badge>
                  </span>
                )}
              </th>
              <td className={styles.nowrap}>{formatDayMonthYear(parseIsoDate(voucher.date))}</td>
              <td>{VOUCHER_TYPE_DETAILS[voucher.type].label}</td>
              <td>
                {voucher.narration}
                {voucher.reference && <span className={styles.subtext}>{voucher.reference}</span>}
              </td>
              <td>{[...new Set(getAccountNames(voucher, accounts))].join(', ')}</td>
              <td className={`${styles.numeric} ${isCancelled ? styles.struck : ''}`}>
                {formatCurrency(getVoucherTotal(voucher))}
              </td>
            </tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
