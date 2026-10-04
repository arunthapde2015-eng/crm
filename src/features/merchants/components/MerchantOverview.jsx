import { SALESPERSON_NAMES } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';
import { formatMobile, getTelHref } from '@/utils/formatPhone';

import { MERCHANT_STATUS_LABELS, MERCHANT_TYPE_LABELS } from '../constants';
import { getLinkedCounts } from '../utils/merchantDetails';
import { formatLinkedRecords } from '../utils/merchantQueries';
import styles from './MerchantDetails.module.css';

/**
 * @param {object} props
 * @param {object} props.merchant
 */
export function MerchantOverview({ merchant }) {
  const details = [
    { label: 'Contact person', value: merchant.contactName || '—' },
    {
      label: 'Mobile',
      value: (
        <a className={styles.link} href={getTelHref(merchant.mobile)}>
          {formatMobile(merchant.mobile)}
        </a>
      ),
    },
    { label: 'Type', value: MERCHANT_TYPE_LABELS[merchant.type] },
    { label: 'GSTIN', value: merchant.gstin || '—' },
    { label: 'State', value: merchant.state },
    { label: 'Executive', value: SALESPERSON_NAMES.get(merchant.ownerId) ?? 'Unassigned' },
    { label: 'Total sales', value: formatCurrency(merchant.totalSales) },
    { label: 'Outstanding', value: formatCurrency(merchant.outstanding) },
    { label: 'Linked records', value: formatLinkedRecords(getLinkedCounts(merchant)) || '—' },
    { label: 'Status', value: MERCHANT_STATUS_LABELS[merchant.status] },
    { label: 'Created', value: formatDayMonthYear(parseIsoDate(merchant.createdOn)) },
  ];

  return (
    <dl className={styles.details}>
      {details.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
