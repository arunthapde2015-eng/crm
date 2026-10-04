import { SALESPERSON_NAMES } from '@/constants/team';
import { addDays, toIsoDate } from '@/utils/formatDate';

import {
  AMC_EXPIRY_WARNING_DAYS,
  COLUMN_TYPES,
  MERCHANT_STATUS_LABELS,
  QUOTATION_STATUS_LABELS,
  REPORT_IDS,
} from '../constants';
import { isInRange } from './dateRange';

const { TEXT, CURRENCY, DATE } = COLUMN_TYPES;

function executiveName(executiveId) {
  return SALESPERSON_NAMES.get(executiveId) ?? 'Unassigned';
}

function byDate(getDate) {
  return (first, second) => getDate(first).localeCompare(getDate(second));
}

export const quotationsReport = {
  id: REPORT_IDS.QUOTATIONS,
  label: 'Quotations',
  description: 'Quotations issued in this period and where each one stands.',
  columns: [
    { key: 'number', label: 'Quotation', type: TEXT },
    { key: 'date', label: 'Date', type: DATE },
    { key: 'customer', label: 'Customer', type: TEXT },
    { key: 'executive', label: 'Executive', type: TEXT },
    { key: 'total', label: 'Value', type: CURRENCY, hasTotal: true },
    { key: 'status', label: 'Status', type: TEXT },
  ],
  buildRows: ({ data, range }) =>
    data.quotations
      .filter((quotation) => isInRange(quotation.date, range))
      .sort(byDate((quotation) => quotation.date))
      .map((quotation) => ({
        id: quotation.id,
        number: quotation.number,
        date: quotation.date,
        customer: quotation.customer,
        executive: executiveName(quotation.executiveId),
        total: quotation.total,
        status: QUOTATION_STATUS_LABELS[quotation.status],
      })),
};

export const merchantOnboardingReport = {
  id: REPORT_IDS.MERCHANT_ONBOARDING,
  label: 'Merchant onboarding',
  description: 'Merchants onboarded in this period.',
  columns: [
    { key: 'merchantId', label: 'Merchant ID', type: TEXT },
    { key: 'name', label: 'Merchant', type: TEXT },
    { key: 'customer', label: 'Customer', type: TEXT },
    { key: 'onboardedDate', label: 'Onboarded', type: DATE },
    { key: 'executive', label: 'Executive', type: TEXT },
    { key: 'status', label: 'Status', type: TEXT },
  ],
  buildRows: ({ data, range }) =>
    data.merchants
      .filter((merchant) => isInRange(merchant.onboardedDate, range))
      .sort(byDate((merchant) => merchant.onboardedDate))
      .map((merchant) => ({
        id: merchant.id,
        merchantId: merchant.id,
        name: merchant.name,
        customer: merchant.customer,
        onboardedDate: merchant.onboardedDate,
        executive: executiveName(merchant.executiveId),
        status: MERCHANT_STATUS_LABELS[merchant.status],
      })),
};

/** Status as of today: expired, expiring within the warning window, or active. */
export function getAmcStatus(endDate, today) {
  const todayIsoDate = toIsoDate(today);
  if (endDate < todayIsoDate) return 'Expired';
  if (endDate <= toIsoDate(addDays(today, AMC_EXPIRY_WARNING_DAYS))) return 'Expiring soon';
  return 'Active';
}

export const amcReport = {
  id: REPORT_IDS.AMC,
  label: 'AMC',
  description: `AMC contracts started in this period. Status is as of today; "Expiring soon" means within ${AMC_EXPIRY_WARNING_DAYS} days.`,
  columns: [
    { key: 'contract', label: 'Contract', type: TEXT },
    { key: 'customer', label: 'Customer', type: TEXT },
    { key: 'product', label: 'Product', type: TEXT },
    { key: 'startDate', label: 'Start', type: DATE },
    { key: 'endDate', label: 'End', type: DATE },
    { key: 'amount', label: 'Amount', type: CURRENCY, hasTotal: true },
    { key: 'status', label: 'Status', type: TEXT },
  ],
  buildRows: ({ data, range, today }) =>
    data.amcContracts
      .filter((contract) => isInRange(contract.startDate, range))
      .sort(byDate((contract) => contract.endDate))
      .map((contract) => ({
        id: contract.id,
        contract: contract.id,
        customer: contract.customer,
        product: contract.product,
        startDate: contract.startDate,
        endDate: contract.endDate,
        amount: contract.amount,
        status: getAmcStatus(contract.endDate, today),
      })),
};

export const collectionsReport = {
  id: REPORT_IDS.COLLECTIONS,
  label: 'Collections',
  description: 'Payments received in this period, against the invoice they settle.',
  columns: [
    { key: 'date', label: 'Date', type: DATE },
    { key: 'customer', label: 'Customer', type: TEXT },
    { key: 'invoice', label: 'Invoice', type: TEXT },
    { key: 'mode', label: 'Mode', type: TEXT },
    { key: 'amount', label: 'Amount', type: CURRENCY, hasTotal: true },
  ],
  buildRows: ({ data, range }) =>
    data.invoices
      .flatMap((invoice) =>
        invoice.payments.map((payment, index) => ({
          id: `${invoice.number}-${index}`,
          date: payment.date,
          customer: invoice.customer,
          invoice: invoice.number,
          mode: payment.mode,
          amount: payment.amount,
        })),
      )
      .filter((row) => isInRange(row.date, range))
      .sort(byDate((row) => row.date)),
};
