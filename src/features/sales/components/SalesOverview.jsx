import { useState } from 'react';

import { STAT_TONES, StatGrid } from '@/components/StatGrid';
import { formatMonthKey } from '@/utils/dateRange';
import { formatCurrency } from '@/utils/formatCurrency';

import { DEFAULT_PERIOD, PERIODS } from '../constants';
import {
  getSalesByMonth,
  getSalesBySalesperson,
  getSalesMetrics,
  getTargetAchievement,
} from '../utils/metrics';
import { getPeriodRange, toMonthKey } from '../utils/period';
import { BarChart } from './BarChart';
import { PeriodFilter } from './PeriodFilter';
import { ProgressBar } from './ProgressBar';
import layout from './SalesLayout.module.css';

function getPipelineStats(metrics) {
  return [
    { id: 'total-leads', label: 'Total leads', value: metrics.totalLeads },
    { id: 'new-leads', label: 'New leads', value: metrics.newLeads },
    { id: 'qualified', label: 'Qualified', value: metrics.qualified },
    { id: 'proposals', label: 'Proposals sent', value: metrics.proposals },
    { id: 'negotiations', label: 'Negotiations', value: metrics.negotiations },
    { id: 'won', label: 'Won', value: metrics.won },
    { id: 'lost', label: 'Lost', value: metrics.lost, tone: STAT_TONES.DANGER },
    { id: 'conversion', label: 'Conversion rate', value: `${metrics.conversionRate}%` },
  ];
}

function getMoneyStats(metrics) {
  return [
    { id: 'total-sales', label: 'Total sales', value: formatCurrency(metrics.totalSales) },
    { id: 'collected', label: 'Collected', value: formatCurrency(metrics.collected) },
    {
      id: 'pending',
      label: 'Pending',
      value: formatCurrency(metrics.pending),
      tone: STAT_TONES.WARNING,
    },
    { id: 'average', label: 'Average deal', value: formatCurrency(metrics.averageDealValue) },
  ];
}

/**
 * @param {object} props
 * @param {object} props.data - Sales data (team, orders, leads, ...).
 * @param {Date} props.today
 */
export function SalesOverview({ data, today }) {
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [customRange, setCustomRange] = useState(() => getPeriodRange(DEFAULT_PERIOD, today));
  const range = period === PERIODS.CUSTOM ? customRange : getPeriodRange(period, today);
  const isRangeValid = range.from && range.to && range.from <= range.to;

  const currentMonthKey = toMonthKey(today);
  const achievement = getTargetAchievement(data, currentMonthKey);

  function handlePeriodChange(nextPeriod) {
    // Switching to Custom starts from whatever range was showing.
    if (nextPeriod === PERIODS.CUSTOM) setCustomRange(range);
    setPeriod(nextPeriod);
  }

  return (
    <div className={layout.stack}>
      <PeriodFilter
        period={period}
        range={range}
        onPeriodChange={handlePeriodChange}
        onCustomRangeChange={setCustomRange}
      />
      {isRangeValid ? (
        <PeriodFigures data={data} range={range} />
      ) : (
        <p className={layout.formError} role="alert">
          Choose a start date that is on or before the end date.
        </p>
      )}

      <section className={layout.section} aria-labelledby="sales-target-heading">
        <h2 id="sales-target-heading" className={layout.sectionTitle}>
          Target vs achievement, {formatMonthKey(currentMonthKey)}
        </h2>
        <ul className={layout.stack} aria-label="Monthly targets">
          {achievement.map((row) => (
            <li key={row.id} className={layout.section}>
              <span>
                {row.name}{' '}
                <span className={layout.note}>
                  {formatCurrency(row.achieved)} of {formatCurrency(row.target)}
                </span>
              </span>
              <ProgressBar percent={row.percent} label={`${row.name} target achieved`} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PeriodFigures({ data, range }) {
  const metrics = getSalesMetrics(data, range);
  const monthRows = getSalesByMonth(data, range).map((row) => ({
    ...row,
    label: formatMonthKey(row.monthKey),
  }));

  return (
    <>
      <div className={layout.section}>
        <h2 className={layout.sectionTitle}>Pipeline</h2>
        <StatGrid label="Pipeline" stats={getPipelineStats(metrics)} />
      </div>
      <div className={layout.section}>
        <h2 className={layout.sectionTitle}>Sales & collections</h2>
        <StatGrid label="Sales & collections" stats={getMoneyStats(metrics)} />
      </div>
      <div className={layout.chartGrid}>
        <BarChart
          title="Sales by salesperson"
          rows={getSalesBySalesperson(data, range)}
          formatValue={formatCurrency}
        />
        <BarChart title="Monthly sales" rows={monthRows} formatValue={formatCurrency} />
      </div>
    </>
  );
}
