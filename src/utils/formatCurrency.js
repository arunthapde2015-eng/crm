const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** Whole rupees with Indian digit grouping: 764631 → "₹7,64,631". */
export function formatCurrency(amount) {
  return inrFormatter.format(amount);
}
