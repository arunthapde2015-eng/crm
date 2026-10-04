const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrExactFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Whole rupees with Indian digit grouping: 764631 → "₹7,64,631". */
export function formatCurrency(amount) {
  return inrFormatter.format(amount);
}

const twoDecimalFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Rupees and paise, as printed on documents: 45000 → "₹45,000.00". */
export function formatCurrencyExact(amount) {
  return inrExactFormatter.format(amount);
}

/** Two decimals, no currency sign, for invoice tables: 32500 → "32,500.00", 1 → "1.00". */
export function formatTwoDecimals(value) {
  return twoDecimalFormatter.format(value);
}
