import { SALESPERSONS, SALESPERSON_NAMES } from '@/constants/team';
import { formatMonthKey, getMonthKeys, isInRange } from '@/utils/dateRange';

import { COLUMN_TYPES, REPORT_IDS } from '../constants';
import {
  getAmountPaid,
  getGstAmount,
  getGstSplit,
  getInvoiceTotal,
  getOutstanding,
  groupBy,
  sumBy,
  toPercent,
} from './invoiceMath';

const { TEXT, NUMBER, CURRENCY, PERCENT } = COLUMN_TYPES;

function invoicesInRange(data, range) {
  return data.invoices.filter((invoice) => isInRange(invoice.date, range));
}

function executiveName(executiveId) {
  return SALESPERSON_NAMES.get(executiveId) ?? 'Unassigned';
}

function byTotalDescending(first, second) {
  return second.total - first.total;
}

/** Invoice count and money totals for a group of invoices. */
function summariseInvoices(invoices) {
  return {
    invoiceCount: invoices.length,
    taxable: sumBy(invoices, (invoice) => invoice.taxable),
    total: sumBy(invoices, getInvoiceTotal),
    received: sumBy(invoices, getAmountPaid),
    outstanding: sumBy(invoices, getOutstanding),
  };
}

export const salesByExecutiveReport = {
  id: REPORT_IDS.SALES_BY_EXECUTIVE,
  label: 'Sales by executive',
  description: 'Invoices dated in this period, by the executive who made the sale.',
  columns: [
    { key: 'name', label: 'Sales executive', type: TEXT },
    { key: 'invoiceCount', label: 'Invoices', type: NUMBER, hasTotal: true },
    { key: 'taxable', label: 'Taxable', type: CURRENCY, hasTotal: true },
    { key: 'total', label: 'Total', type: CURRENCY, hasTotal: true },
    { key: 'outstanding', label: 'Outstanding', type: CURRENCY, hasTotal: true },
  ],
  buildRows: ({ data, range }) =>
    [...groupBy(invoicesInRange(data, range), (invoice) => invoice.executiveId)]
      .map(([executiveId, invoices]) => ({
        id: executiveId ?? 'unassigned',
        name: executiveName(executiveId),
        ...summariseInvoices(invoices),
      }))
      .sort(byTotalDescending),
};

export const performanceReport = {
  id: REPORT_IDS.PERFORMANCE,
  label: 'Performance',
  description: 'Leads received, deals won and value invoiced per executive in this period.',
  columns: [
    { key: 'name', label: 'Sales executive', type: TEXT },
    { key: 'leadCount', label: 'Leads', type: NUMBER, hasTotal: true },
    { key: 'wonCount', label: 'Won', type: NUMBER, hasTotal: true },
    { key: 'conversion', label: 'Conversion', type: PERCENT },
    { key: 'quotationCount', label: 'Quotations', type: NUMBER, hasTotal: true },
    { key: 'invoiced', label: 'Invoiced', type: CURRENCY, hasTotal: true },
  ],
  buildRows: ({ data, range }) => {
    const leads = data.leads.filter((lead) => isInRange(lead.date, range));
    const quotations = data.quotations.filter((quotation) => isInRange(quotation.date, range));
    const invoices = invoicesInRange(data, range);

    return SALESPERSONS.map(({ id, name }) => {
      const ownLeads = leads.filter((lead) => lead.executiveId === id);
      const wonCount = ownLeads.filter((lead) => lead.outcome === 'won').length;
      return {
        id,
        name,
        leadCount: ownLeads.length,
        wonCount,
        conversion: toPercent(wonCount, ownLeads.length),
        quotationCount: quotations.filter((quotation) => quotation.executiveId === id).length,
        invoiced: sumBy(
          invoices.filter((invoice) => invoice.executiveId === id),
          getInvoiceTotal,
        ),
      };
    });
  },
};

export const productWiseReport = {
  id: REPORT_IDS.PRODUCT_WISE,
  label: 'Product-wise',
  description: 'Invoiced value per product in this period.',
  columns: [
    { key: 'product', label: 'Product', type: TEXT },
    { key: 'invoiceCount', label: 'Invoices', type: NUMBER, hasTotal: true },
    { key: 'taxable', label: 'Taxable', type: CURRENCY, hasTotal: true },
    { key: 'total', label: 'Total', type: CURRENCY, hasTotal: true },
  ],
  buildRows: ({ data, range }) =>
    [...groupBy(invoicesInRange(data, range), (invoice) => invoice.product)]
      .map(([product, invoices]) => ({ id: product, product, ...summariseInvoices(invoices) }))
      .sort(byTotalDescending),
};

export const customerWiseReport = {
  id: REPORT_IDS.CUSTOMER_WISE,
  label: 'Customer / merchant-wise',
  description: 'Invoiced, received and outstanding amounts per customer in this period.',
  columns: [
    { key: 'customer', label: 'Customer', type: TEXT },
    { key: 'invoiceCount', label: 'Invoices', type: NUMBER, hasTotal: true },
    { key: 'total', label: 'Invoiced', type: CURRENCY, hasTotal: true },
    { key: 'received', label: 'Received', type: CURRENCY, hasTotal: true },
    { key: 'outstanding', label: 'Outstanding', type: CURRENCY, hasTotal: true },
  ],
  buildRows: ({ data, range }) =>
    [...groupBy(invoicesInRange(data, range), (invoice) => invoice.customer)]
      .map(([customer, invoices]) => ({ id: customer, customer, ...summariseInvoices(invoices) }))
      .sort(byTotalDescending),
};

export const monthlyReport = {
  id: REPORT_IDS.MONTHLY,
  label: 'Monthly',
  description: 'Invoices raised and money collected in each month of this period.',
  columns: [
    { key: 'month', label: 'Month', type: TEXT },
    { key: 'invoiceCount', label: 'Invoices', type: NUMBER, hasTotal: true },
    { key: 'taxable', label: 'Taxable', type: CURRENCY, hasTotal: true },
    { key: 'gst', label: 'GST', type: CURRENCY, hasTotal: true },
    { key: 'total', label: 'Total', type: CURRENCY, hasTotal: true },
    { key: 'collected', label: 'Collected', type: CURRENCY, hasTotal: true },
  ],
  buildRows: ({ data, range }) => {
    const invoices = invoicesInRange(data, range);
    const payments = data.invoices
      .flatMap((invoice) => invoice.payments)
      .filter((payment) => isInRange(payment.date, range));

    return getMonthKeys(range).map((monthKey) => {
      const monthInvoices = invoices.filter((invoice) => invoice.date.startsWith(monthKey));
      return {
        id: monthKey,
        month: formatMonthKey(monthKey),
        invoiceCount: monthInvoices.length,
        taxable: sumBy(monthInvoices, (invoice) => invoice.taxable),
        gst: sumBy(monthInvoices, getGstAmount),
        total: sumBy(monthInvoices, getInvoiceTotal),
        collected: sumBy(
          payments.filter((payment) => payment.date.startsWith(monthKey)),
          (payment) => payment.amount,
        ),
      };
    });
  },
};

export const gstSummaryReport = {
  id: REPORT_IDS.GST_SUMMARY,
  label: 'GST summary',
  description: 'Output GST on invoices dated in this period, by tax rate.',
  columns: [
    { key: 'rate', label: 'GST rate', type: TEXT },
    { key: 'invoiceCount', label: 'Invoices', type: NUMBER, hasTotal: true },
    { key: 'taxable', label: 'Taxable', type: CURRENCY, hasTotal: true },
    { key: 'cgst', label: 'CGST', type: CURRENCY, hasTotal: true },
    { key: 'sgst', label: 'SGST', type: CURRENCY, hasTotal: true },
    { key: 'igst', label: 'IGST', type: CURRENCY, hasTotal: true },
    { key: 'gst', label: 'Total GST', type: CURRENCY, hasTotal: true },
  ],
  buildRows: ({ data, range }) =>
    [...groupBy(invoicesInRange(data, range), (invoice) => invoice.gstRate)]
      .sort(([firstRate], [secondRate]) => secondRate - firstRate)
      .map(([gstRate, invoices]) => {
        const splits = invoices.map(getGstSplit);
        return {
          id: String(gstRate),
          rate: `${gstRate}%`,
          invoiceCount: invoices.length,
          taxable: sumBy(invoices, (invoice) => invoice.taxable),
          cgst: sumBy(splits, (split) => split.cgst),
          sgst: sumBy(splits, (split) => split.sgst),
          igst: sumBy(splits, (split) => split.igst),
          gst: sumBy(invoices, getGstAmount),
        };
      }),
};
