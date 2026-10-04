import { getMonthKeys } from '@/utils/dateRange';

import { getReportData } from '../api/reportData';
import { COLUMN_TYPES, DATE_PRESETS, REPORT_IDS } from '../constants';
import { toCsv } from './csv';
import { findMatchingPreset, getDefaultRange, getPresetRange, isValidRange } from './dateRange';
import { getAmcStatus } from './operationsReports';
import { REPORTS, getTotalsRow } from './reports';

const TODAY = new Date(2026, 9, 1);
const DATA = getReportData();
const DEFAULT_RANGE = getDefaultRange(TODAY);

function buildReport(reportId, range = DEFAULT_RANGE) {
  const report = REPORTS.find((item) => item.id === reportId);
  const rows = report.buildRows({ data: DATA, range, today: TODAY });
  return { report, rows, totals: getTotalsRow(report.columns, rows) };
}

describe('date ranges', () => {
  it('defaults to the last 180 days', () => {
    expect(DEFAULT_RANGE).toEqual({ from: '2026-04-04', to: '2026-10-01' });
    expect(findMatchingPreset(DEFAULT_RANGE, TODAY)).toBeNull();
  });

  it('computes presets ending today', () => {
    expect(getPresetRange(DATE_PRESETS.THIS_MONTH, TODAY)).toEqual({
      from: '2026-10-01',
      to: '2026-10-01',
    });
    expect(getPresetRange(DATE_PRESETS.THIS_FY, TODAY).from).toBe('2026-04-01');
    expect(getPresetRange(DATE_PRESETS.THIS_FY, new Date(2027, 1, 10)).from).toBe('2026-04-01');
  });

  it('lists every month the range touches, across a year end', () => {
    expect(getMonthKeys({ from: '2026-11-20', to: '2027-02-03' })).toEqual([
      '2026-11',
      '2026-12',
      '2027-01',
      '2027-02',
    ]);
  });

  it('rejects ranges that end before they start', () => {
    expect(isValidRange({ from: '2026-05-01', to: '2026-04-01' })).toBe(false);
  });
});

describe('report figures', () => {
  it('sales by executive matches the expected totals', () => {
    const { rows } = buildReport(REPORT_IDS.SALES_BY_EXECUTIVE);

    expect(rows).toEqual([
      expect.objectContaining({
        name: 'Rohan Kulkarni',
        invoiceCount: 6,
        taxable: 398750,
        total: 469565,
        outstanding: 129065,
      }),
      expect.objectContaining({
        name: 'Sneha Patil',
        invoiceCount: 2,
        taxable: 95300,
        total: 112166,
        outstanding: 24376,
      }),
    ]);
  });

  it('keeps every money report consistent with the invoices', () => {
    const invoiced = buildReport(REPORT_IDS.SALES_BY_EXECUTIVE).totals.total;
    const outstanding = buildReport(REPORT_IDS.SALES_BY_EXECUTIVE).totals.outstanding;

    expect(buildReport(REPORT_IDS.PRODUCT_WISE).totals.total).toBe(invoiced);
    expect(buildReport(REPORT_IDS.MONTHLY).totals.total).toBe(invoiced);
    expect(buildReport(REPORT_IDS.CUSTOMER_WISE).totals.outstanding).toBe(outstanding);
    expect(buildReport(REPORT_IDS.COLLECTIONS).totals.amount).toBe(invoiced - outstanding);
  });

  it('splits GST into CGST/SGST in-state and IGST out of state', () => {
    const { rows, totals } = buildReport(REPORT_IDS.GST_SUMMARY);
    const twelvePercent = rows.find((row) => row.rate === '12%');

    // 12%: Deccan Motors (Maharashtra, ₹1,920) and Konkan Fresh Mart (Goa, ₹576).
    expect(twelvePercent).toMatchObject({ cgst: 960, sgst: 960, igst: 576, gst: 2496 });
    expect(totals.cgst + totals.sgst + totals.igst).toBe(totals.gst);
  });

  it('reports conversion per executive without a meaningless total', () => {
    const { rows, totals } = buildReport(REPORT_IDS.PERFORMANCE);

    expect(rows.find((row) => row.id === 'rohan')).toMatchObject({
      leadCount: 8,
      wonCount: 4,
      conversion: 50,
    });
    expect(totals.conversion).toBeUndefined();
  });

  it('returns no rows and no totals for an empty period', () => {
    const { rows, totals } = buildReport(REPORT_IDS.COLLECTIONS, {
      from: '2025-01-01',
      to: '2025-01-31',
    });

    expect(rows).toEqual([]);
    expect(totals).toBeNull();
  });
});

describe('getAmcStatus', () => {
  it('flags expired and soon-to-expire contracts', () => {
    expect(getAmcStatus('2026-09-14', TODAY)).toBe('Expired');
    expect(getAmcStatus('2026-10-20', TODAY)).toBe('Expiring soon');
    expect(getAmcStatus('2027-04-19', TODAY)).toBe('Active');
  });
});

describe('toCsv', () => {
  it('quotes awkward values and keeps numbers raw', () => {
    const columns = [
      { key: 'name', label: 'Name', type: COLUMN_TYPES.TEXT },
      { key: 'date', label: 'Date', type: COLUMN_TYPES.DATE },
      { key: 'amount', label: 'Amount', type: COLUMN_TYPES.CURRENCY },
    ];
    const rows = [{ name: 'Acme, "Pune"', date: '2026-04-05', amount: 141600 }];

    expect(toCsv(columns, rows, { name: 'Total', amount: 141600 })).toBe(
      'Name,Date,Amount\r\n"Acme, ""Pune""",05-04-2026,141600\r\nTotal,,141600',
    );
  });
});
