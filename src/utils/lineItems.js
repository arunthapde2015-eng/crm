import { COMPANY_STATE } from '@/constants/company';

// Money maths for billing documents (quotations, proformas, ...). A document has `items`
// ({ quantity, unitPrice, gstRate }), an optional document-wide `discountPercent`, and a
// `placeOfSupply` state.

const PERCENT = 100;
export const DEFAULT_GST_RATE = 18;
export const GST_RATES = [0, 5, 12, 18, 28];

function discountOf(document) {
  return document.discountPercent ?? 0;
}

export function getGross(document) {
  return document.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

export function getDiscountAmount(document) {
  return Math.round((getGross(document) * discountOf(document)) / PERCENT);
}

export function getTaxable(document) {
  return getGross(document) - getDiscountAmount(document);
}

/** A line's value after the document-wide discount, before GST. */
export function getLineTaxable(document, item) {
  const lineGross = item.quantity * item.unitPrice;
  return lineGross - (lineGross * discountOf(document)) / PERCENT;
}

/** GST is charged per line at that line's rate, on the discounted line value. */
export function getGst(document) {
  return document.items.reduce(
    (total, item) => total + Math.round((getLineTaxable(document, item) * item.gstRate) / PERCENT),
    0,
  );
}

export function getTotal(document) {
  return getTaxable(document) + getGst(document);
}

/**
 * GST split by place of supply: within the company's state it is shared equally between
 * CGST and SGST; to another state it is all IGST.
 */
export function getGstSplit(document) {
  const gst = getGst(document);
  if (document.placeOfSupply !== COMPANY_STATE) return { cgst: 0, sgst: 0, igst: gst };
  const cgst = Math.round(gst / 2);
  return { cgst, sgst: gst - cgst, igst: 0 };
}

/** "18%" for a single rate, "12–18%" when lines mix rates. */
export function getGstRateLabel(document) {
  const rates = [...new Set(document.items.map((item) => item.gstRate))].sort((a, b) => a - b);
  if (rates.length === 0) return '';
  return rates.length === 1 ? `${rates[0]}%` : `${rates[0]}–${rates[rates.length - 1]}%`;
}

// ---- Editing lines ---------------------------------------------------------

/** A blank line for a form. Form values are strings until parsed. */
export function createEmptyLine() {
  return {
    id: crypto.randomUUID(),
    product: '',
    description: '',
    hsn: '',
    quantity: '1',
    unitPrice: '',
    gstRate: String(DEFAULT_GST_RATE),
  };
}

export function toLineFormValues(items) {
  return items.map((item) => ({
    id: item.id,
    product: item.product,
    description: item.description ?? '',
    hsn: item.hsn ?? '',
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
    gstRate: String(item.gstRate),
  }));
}

/** Form lines → numeric lines, dropping lines with no product name. */
export function parseLineFormValues(lines) {
  return lines
    .filter((line) => line.product.trim() !== '')
    .map((line) => ({
      id: line.id,
      product: line.product.trim(),
      description: line.description.trim(),
      hsn: line.hsn.trim(),
      quantity: Number(line.quantity) || 0,
      unitPrice: Number(line.unitPrice) || 0,
      gstRate: Number(line.gstRate),
    }));
}

/** Problems with parsed lines, or [] if they're fine. */
export function validateLines(items) {
  const errors = [];
  if (items.length === 0) errors.push('Add at least one product or service.');
  if (items.some((item) => item.quantity <= 0 || item.unitPrice < 0)) {
    errors.push('Each line needs a quantity above zero and a price of zero or more.');
  }
  return errors;
}
