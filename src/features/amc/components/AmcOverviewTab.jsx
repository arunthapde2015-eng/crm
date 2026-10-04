import { BADGE_TONES, Badge } from '@/components/Badge';
import { SALESPERSON_NAMES } from '@/constants/team';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';
import { formatMobile, getTelHref } from '@/utils/formatPhone';
import { getPanFromGstin } from '@/utils/gstin';

import { AMC_STATUS_LABELS, MERCHANT_STATUSES, MERCHANT_STATUS_LABELS } from '../constants';
import { getStatus } from '../utils/amc';
import { getLatestRemark } from '../utils/merchantProfile';
import { AMC_STATUS_TONES } from './amcStatusTones';
import styles from './AmcDrawer.module.css';

/**
 * Merchant outlet details: who they are, how to reach them and where the AMC stands.
 *
 * @param {object} props
 * @param {object} props.contract
 * @param {string} props.todayIso
 * @param {() => void} props.onOpenCustomer - Goes to the customer's merchant record.
 */
export function AmcOverviewTab({ contract, todayIso, onOpenCustomer }) {
  const amcStatus = getStatus(contract, todayIso);
  const isActive = contract.status === MERCHANT_STATUSES.ACTIVE;
  const details = [
    { label: 'Merchant ID', value: contract.merchantCode },
    {
      label: 'Customer',
      value: (
        <button type="button" className={styles.linkButton} onClick={onOpenCustomer}>
          {contract.customerName} ({contract.customerCode})
        </button>
      ),
    },
    { label: 'Institution / company', value: contract.customerName },
    { label: 'Contact person', value: contract.contactName },
    {
      label: 'Mobile',
      value: (
        <a className={styles.link} href={getTelHref(contract.mobile)}>
          {formatMobile(contract.mobile)}
        </a>
      ),
    },
    { label: 'Email', value: contract.email || '—' },
    { label: 'Address', value: contract.address },
    { label: 'GSTIN', value: contract.gstin || '—' },
    { label: 'PAN', value: getPanFromGstin(contract.gstin) || '—' },
    { label: 'Product / service', value: contract.product },
    { label: 'Assigned to', value: SALESPERSON_NAMES.get(contract.assignedTo) ?? 'Unassigned' },
    {
      label: 'Merchant status',
      value: (
        <Badge tone={isActive ? BADGE_TONES.SUCCESS : BADGE_TONES.NEUTRAL}>
          {MERCHANT_STATUS_LABELS[contract.status]}
        </Badge>
      ),
    },
    { label: 'Onboarding date', value: formatDayMonthYear(parseIsoDate(contract.onboardedDate)) },
    {
      label: 'AMC status',
      value: <Badge tone={AMC_STATUS_TONES[amcStatus]}>{AMC_STATUS_LABELS[amcStatus]}</Badge>,
    },
    { label: 'Remarks', value: getLatestRemark(contract) || '—' },
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
