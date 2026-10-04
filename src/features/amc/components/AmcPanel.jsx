import { useState } from 'react';

import { PageHeader } from '@/components/PageHeader';
import { SelectField } from '@/components/SelectField';
import { STAT_TONES, StatGrid } from '@/components/StatGrid';
import { NAV_IDS } from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { toIsoDate } from '@/utils/formatDate';

import { ALL_FILTER_VALUE, AMC_STATUSES, AMC_STATUS_LABELS, REMINDER_DAYS } from '../constants';
import { useAmcContracts } from '../hooks/useAmcContracts';
import {
  createMarkedPayment,
  createRenewalPeriod,
  filterContracts,
  getRenewalFormValues,
  getSummary,
} from '../utils/amc';
import { createActivity } from '../utils/merchantProfile';
import { AmcMerchantDrawer } from './AmcMerchantDrawer';
import { AmcTable } from './AmcTable';
import { RenewalForm } from './RenewalForm';
import styles from './Amc.module.css';

const STATUS_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All statuses' },
  ...Object.entries(AMC_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

/** "90, 60, 30, 15 and 7 days before expiry, and on the expiry date" */
function describeReminders(reminderDays) {
  const before = reminderDays.filter((days) => days > 0);
  const daysText = `${before.slice(0, -1).join(', ')} and ${before.at(-1)} days before expiry`;
  return reminderDays.includes(0) ? `${daysText}, and on the expiry date` : daysText;
}

function getStats({ counts, billed, dues }) {
  return [
    { id: 'active', label: 'Active', value: counts[AMC_STATUSES.ACTIVE] },
    {
      id: 'expiring',
      label: 'Expiring soon',
      value: counts[AMC_STATUSES.EXPIRING_SOON],
      tone: STAT_TONES.WARNING,
    },
    {
      id: 'expired',
      label: 'Expired',
      value: counts[AMC_STATUSES.EXPIRED],
      tone: STAT_TONES.DANGER,
    },
    { id: 'renewed', label: 'Renewed', value: counts[AMC_STATUSES.RENEWED] },
    {
      id: 'pending-first',
      label: 'Pending first payment',
      value: counts[AMC_STATUSES.PENDING_FIRST_PAYMENT],
    },
    { id: 'billed', label: 'AMC revenue billed', value: formatCurrency(billed) },
    { id: 'dues', label: 'AMC dues outstanding', value: formatCurrency(dues) },
  ];
}

/**
 * Yearly AMC contracts per merchant outlet: what's expiring, reminders and renewals.
 *
 * @param {object} props
 * @param {(navId: string) => void} props.onNavigate - Opens another page (quotations, merchants).
 * @param {Date} [props.today] - Injectable for tests.
 */
export function AmcPanel({ onNavigate, today = new Date() }) {
  const { currentUser } = useAuth();
  const todayIso = toIsoDate(today);
  const { contracts, addPeriod, markPaid, updateContract } = useAmcContracts();
  const [filters, setFilters] = useState({ query: '', status: ALL_FILTER_VALUE });
  const [renewingId, setRenewingId] = useState(null);
  const [openContractId, setOpenContractId] = useState(null);

  const visibleContracts = filterContracts(contracts, todayIso, filters);
  const renewingContract = contracts.find((contract) => contract.id === renewingId);
  const openContract = contracts.find((contract) => contract.id === openContractId);

  function renew(contractId, values) {
    addPeriod(contractId, createRenewalPeriod(values, contracts, todayIso));
  }

  function handleRenewalSubmit(values) {
    renew(renewingId, values);
    setRenewingId(null);
  }

  function handleUpdate(changes, note, isRemark = false) {
    const activity = createActivity(todayIso, note, currentUser.name, isRemark);
    updateContract(openContractId, changes, activity);
  }

  return (
    <>
      <PageHeader
        title="AMC renewals"
        description={`Reminders go out ${describeReminders(REMINDER_DAYS)}. Change this in Settings.`}
      />

      <div className={styles.body}>
        <StatGrid label="AMC summary" stats={getStats(getSummary(contracts, todayIso))} />

        {renewingContract && (
          <RenewalForm
            key={renewingContract.id}
            contract={renewingContract}
            initialValues={getRenewalFormValues(renewingContract, todayIso)}
            todayIso={todayIso}
            onSubmit={handleRenewalSubmit}
            onCancel={() => setRenewingId(null)}
          />
        )}

        <div className={styles.filters}>
          <label htmlFor="amc-filter-query" className="visually-hidden">
            Filter AMC contracts
          </label>
          <input
            id="amc-filter-query"
            type="search"
            className={styles.searchInput}
            placeholder="Filter this list"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
          />
          <SelectField
            id="amc-filter-status"
            label="Status"
            isLabelHidden
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          />
        </div>

        <AmcTable
          contracts={visibleContracts}
          todayIso={todayIso}
          onOpen={(contract) => setOpenContractId(contract.id)}
          onRenew={(contract) => setRenewingId(contract.id)}
          onMarkPaid={(contract, period) =>
            markPaid(contract.id, createMarkedPayment(period, todayIso))
          }
        />
      </div>

      {openContract && (
        <AmcMerchantDrawer
          contract={openContract}
          todayIso={todayIso}
          onRenew={(values) => renew(openContract.id, values)}
          onUpdate={handleUpdate}
          onNewQuotation={() => onNavigate(NAV_IDS.QUOTATIONS)}
          onOpenCustomer={() => onNavigate(NAV_IDS.MERCHANTS)}
          onClose={() => setOpenContractId(null)}
        />
      )}
    </>
  );
}
