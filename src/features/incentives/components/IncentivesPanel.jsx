import { useState } from 'react';

import { PageHeader } from '@/components/PageHeader';
import { STAT_TONES, StatGrid } from '@/components/StatGrid';
import { Tabs } from '@/components/Tabs';
import { SALESPERSONS, SALESPERSON_NAMES } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';

import { DEFAULT_FILTERS, INCENTIVE_TAB_IDS, INCENTIVE_TABS } from '../constants';
import { useIncentives } from '../hooks/useIncentives';
import {
  createPayout,
  filterOrderIncentives,
  getOrderIncentives,
  getSalespersonSummary,
  isAwaitingPayout,
  summariseIncentives,
} from '../utils/incentives';
import { IncentiveFilters } from './IncentiveFilters';
import { OrderIncentivesTable } from './OrderIncentivesTable';
import { PayoutForm } from './PayoutForm';
import { PayoutHistoryTable } from './PayoutHistoryTable';
import { RuleEditor } from './RuleEditor';
import { SalespersonSummaryTable } from './SalespersonSummaryTable';
import styles from './Incentives.module.css';

function getSummaryStats(totals) {
  return [
    { id: 'orders', label: 'Total orders', value: totals.orderCount },
    { id: 'earned', label: 'Incentive earned', value: formatCurrency(totals.earned) },
    {
      id: 'paid',
      label: 'Incentive paid',
      value: formatCurrency(totals.paid),
      tone: STAT_TONES.SUCCESS,
    },
    {
      id: 'unpaid',
      label: 'Unpaid / pending',
      value: formatCurrency(totals.unpaid),
      tone: STAT_TONES.WARNING,
    },
    { id: 'awaiting', label: 'Orders awaiting payout', value: totals.awaitingCount },
  ];
}

/**
 * Incentives: per-salesperson summary, order-wise incentives, rate rules and payouts.
 *
 * @param {object} props
 * @param {Date} [props.today] - Default payout date; injectable for tests.
 * @param {object} [props.initialData]
 */
export function IncentivesPanel({ today = new Date(), initialData }) {
  const { data, setRule, addPayout } = useIncentives(initialData);
  const [activeTabId, setActiveTabId] = useState(INCENTIVE_TAB_IDS.SUMMARY);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  // Orders being paid right now: { salespersonId, orderIds } or null.
  const [pendingPayout, setPendingPayout] = useState(null);
  const [focusedRuleId, setFocusedRuleId] = useState(null);

  const allRows = getOrderIncentives(data);
  const visibleRows = filterOrderIncentives(allRows, filters);
  const totals = summariseIncentives(visibleRows);
  const ordersById = new Map(data.orders.map((order) => [order.id, order]));
  const payoutRows = pendingPayout
    ? allRows.filter((row) => pendingPayout.orderIds.includes(row.id) && isAwaitingPayout(row))
    : [];

  function handleFilterChange(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function startPayout(salespersonId, orderIds) {
    setPendingPayout({ salespersonId, orderIds });
  }

  function confirmPayout(details) {
    addPayout(createPayout(payoutRows, details, data.payouts));
    setPendingPayout(null);
  }

  function renderTab() {
    switch (activeTabId) {
      case INCENTIVE_TAB_IDS.ORDERS:
        return (
          <OrderIncentivesTable
            rows={visibleRows}
            onPay={(row) => startPayout(row.salespersonId, [row.id])}
          />
        );
      case INCENTIVE_TAB_IDS.RATES:
        return (
          <div className={styles.body}>
            <p className={styles.note}>
              Rate changes apply to unpaid orders straight away. Amounts already paid stay as they
              were.
            </p>
            {SALESPERSONS.map((person) => (
              <RuleEditor
                key={person.id}
                person={person}
                rule={data.rules[person.id]}
                isFocused={focusedRuleId === person.id}
                onSave={(rule) => setRule(person.id, rule)}
              />
            ))}
          </div>
        );
      case INCENTIVE_TAB_IDS.PAYOUTS:
        return <PayoutHistoryTable payouts={data.payouts} ordersById={ordersById} />;
      default:
        return (
          <SalespersonSummaryTable
            summary={getSalespersonSummary(visibleRows, SALESPERSONS, data.rules)}
            totals={totals}
            onViewOrders={(salespersonId) => {
              handleFilterChange('salespersonId', salespersonId);
              setActiveTabId(INCENTIVE_TAB_IDS.ORDERS);
            }}
            onSetRate={(salespersonId) => {
              setFocusedRuleId(salespersonId);
              setActiveTabId(INCENTIVE_TAB_IDS.RATES);
            }}
            onPayAll={(salespersonId) =>
              startPayout(
                salespersonId,
                allRows
                  .filter((row) => row.salespersonId === salespersonId && isAwaitingPayout(row))
                  .map((row) => row.id),
              )
            }
          />
        );
    }
  }

  const showsOrderFigures =
    activeTabId === INCENTIVE_TAB_IDS.SUMMARY || activeTabId === INCENTIVE_TAB_IDS.ORDERS;

  return (
    <>
      <PageHeader
        title="Incentives"
        description="What each salesperson has earned per order, what’s been paid, and what’s still due."
      />
      <Tabs
        tabs={INCENTIVE_TABS}
        activeTabId={activeTabId}
        onTabChange={(tabId) => {
          setActiveTabId(tabId);
          setFocusedRuleId(null);
        }}
        label="Incentive sections"
        idPrefix="incentives"
      >
        <div className={styles.body}>
          {showsOrderFigures && (
            <>
              <StatGrid label="Incentive totals" stats={getSummaryStats(totals)} />
              <IncentiveFilters filters={filters} onChange={handleFilterChange} />
            </>
          )}
          {payoutRows.length > 0 && (
            <PayoutForm
              key={pendingPayout.orderIds.join()}
              salespersonName={SALESPERSON_NAMES.get(pendingPayout.salespersonId)}
              rows={payoutRows}
              today={today}
              onConfirm={confirmPayout}
              onCancel={() => setPendingPayout(null)}
            />
          )}
          {renderTab()}
        </div>
      </Tabs>
    </>
  );
}
