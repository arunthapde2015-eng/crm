import { COMPANY_STATE } from '@/constants/company';

const PERCENT = 100;

export function getGstAmount(invoice) {
  return Math.round((invoice.taxable * invoice.gstRate) / PERCENT);
}

export function getInvoiceTotal(invoice) {
  return invoice.taxable + getGstAmount(invoice);
}

export function getAmountPaid(invoice) {
  return invoice.payments.reduce((total, payment) => total + payment.amount, 0);
}

export function getOutstanding(invoice) {
  return getInvoiceTotal(invoice) - getAmountPaid(invoice);
}

/**
 * Splits GST by place of supply: within the company's state it is shared equally between
 * CGST and SGST; to another state it is all IGST.
 */
export function getGstSplit(invoice) {
  const gst = getGstAmount(invoice);
  if (invoice.customerState !== COMPANY_STATE) return { cgst: 0, sgst: 0, igst: gst };

  const cgst = Math.round(gst / 2);
  return { cgst, sgst: gst - cgst, igst: 0 };
}

/** Rounded whole-number percentage, or 0 when there is nothing to divide by. */
export function toPercent(part, whole) {
  return whole > 0 ? Math.round((part / whole) * PERCENT) : 0;
}

/** Groups items by a key, keeping first-seen order. */
export function groupBy(items, getKey) {
  const groups = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  return groups;
}

export function sumBy(items, getValue) {
  return items.reduce((total, item) => total + getValue(item), 0);
}
