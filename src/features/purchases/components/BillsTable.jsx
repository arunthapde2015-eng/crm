import { BADGE_TONES, Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { BILL_STATUSES, BILL_STATUS_LABELS } from '../constants';
import { findVendor, getBillTotal, getGstAmount } from '../utils/purchases';
import styles from './Purchases.module.css';

const COLUMN_COUNT = 9;
const formatDate = (isoDate) => formatDayMonthYear(parseIsoDate(isoDate));

/**
 * @param {object} props
 * @param {object[]} props.bills - Already filtered and sorted.
 * @param {object[]} props.vendors
 * @param {(bill: object) => void} props.onPay
 */
export function BillsTable({ bills, vendors, onPay }) {
  return (
    <DataTable caption="Purchase bills" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">No.</th>
          <th scope="col">Date</th>
          <th scope="col">Vendor</th>
          <th scope="col">Description</th>
          <th scope="col" className={styles.numeric}>
            Amount
          </th>
          <th scope="col" className={styles.numeric}>
            GST
          </th>
          <th scope="col" className={styles.numeric}>
            Total
          </th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {bills.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No purchase bills match these filters.
            </td>
          </tr>
        )}
        {bills.map((bill) => {
          const isPaid = bill.status === BILL_STATUSES.PAID;
          return (
            <tr key={bill.id}>
              <th scope="row" className={styles.nowrap}>
                {bill.number}
                <span className={styles.subtext}>Bill {bill.vendorBillNumber}</span>
              </th>
              <td className={styles.nowrap}>{formatDate(bill.date)}</td>
              <td>{findVendor(vendors, bill.vendorId)?.name ?? '—'}</td>
              <td>{bill.description}</td>
              <td className={styles.numeric}>{formatCurrency(bill.amount)}</td>
              <td className={styles.numeric}>{formatCurrency(getGstAmount(bill))}</td>
              <td className={styles.numeric}>{formatCurrency(getBillTotal(bill))}</td>
              <td>
                <Badge tone={isPaid ? BADGE_TONES.SUCCESS : BADGE_TONES.WARNING}>
                  {BILL_STATUS_LABELS[bill.status]}
                </Badge>
                {isPaid && <span className={styles.subtext}>{formatDate(bill.payment.date)}</span>}
              </td>
              <td className={styles.actions}>
                {!isPaid && (
                  <Button
                    variant="secondary"
                    aria-label={`Pay vendor for ${bill.number}`}
                    onClick={() => onPay(bill)}
                  >
                    Pay vendor
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
