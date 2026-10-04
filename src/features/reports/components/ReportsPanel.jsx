import { useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Tabs } from '@/components/Tabs';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { getReportData } from '../api/reportData';
import { DEFAULT_REPORT_ID } from '../constants';
import { toCsv } from '../utils/csv';
import {
  findMatchingPreset,
  getDefaultRange,
  getPresetRange,
  isValidRange,
} from '../utils/dateRange';
import { REPORTS, getTotalsRow } from '../utils/reports';
import { DateRangeControls } from './DateRangeControls';
import { ReportTable } from './ReportTable';
import styles from './ReportsPanel.module.css';

function formatRange({ from, to }) {
  return `${formatDayMonthYear(parseIsoDate(from))} to ${formatDayMonthYear(parseIsoDate(to))}`;
}

/**
 * @param {object} props
 * @param {Date} [props.today] - Reference date for presets and AMC status; injectable for tests.
 * @param {ReturnType<typeof getReportData>} [props.data]
 */
export function ReportsPanel({ today = new Date(), data = getReportData() }) {
  const [activeReportId, setActiveReportId] = useState(DEFAULT_REPORT_ID);
  const [range, setRange] = useState(() => getDefaultRange(today));
  const [copyMessage, setCopyMessage] = useState('');

  const report = REPORTS.find((item) => item.id === activeReportId);
  const isRangeValid = isValidRange(range);
  const rows = isRangeValid ? report.buildRows({ data, range, today }) : [];
  const totalsRow = getTotalsRow(report.columns, rows);

  function handleReportChange(reportId) {
    setActiveReportId(reportId);
    setCopyMessage('');
  }

  function handleRangeChange(nextRange) {
    setRange(nextRange);
    setCopyMessage('');
  }

  async function handleCopyCsv() {
    try {
      await navigator.clipboard.writeText(toCsv(report.columns, rows, totalsRow));
      setCopyMessage(`Copied ${rows.length} rows. Paste into Excel or Google Sheets.`);
    } catch (error) {
      console.error(error);
      setCopyMessage('Couldn’t copy. Your browser blocked clipboard access.');
    }
  }

  return (
    <>
      <PageHeader
        title="Reports"
        description="Pick a report and date range. Copy as CSV for Excel, or print to PDF."
        actions={
          <>
            <Button variant="secondary" onClick={handleCopyCsv} disabled={rows.length === 0}>
              Copy as CSV
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              Print / PDF
            </Button>
          </>
        }
      />
      <p className={`${styles.copyMessage} print-hidden`} role="status">
        {copyMessage}
      </p>

      <Tabs
        tabs={REPORTS}
        activeTabId={activeReportId}
        onTabChange={handleReportChange}
        label="Reports"
        idPrefix="reports"
      >
        <div className={styles.body}>
          <DateRangeControls
            range={range}
            activePreset={findMatchingPreset(range, today)}
            onRangeChange={handleRangeChange}
            onPresetSelect={(preset) => handleRangeChange(getPresetRange(preset, today))}
          />
          <div>
            <h2 className={styles.reportTitle}>{report.label}</h2>
            <p className={styles.reportMeta}>
              {isRangeValid ? `${formatRange(range)}. ${report.description}` : report.description}
            </p>
          </div>
          {isRangeValid ? (
            <ReportTable
              caption={report.label}
              columns={report.columns}
              rows={rows}
              totalsRow={totalsRow}
            />
          ) : (
            <p className={styles.error} role="alert">
              Choose a start date that is on or before the end date.
            </p>
          )}
        </div>
      </Tabs>
    </>
  );
}
