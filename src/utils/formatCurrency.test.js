import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('uses Indian digit grouping without decimals', () => {
    expect(formatCurrency(941600)).toBe('₹9,41,600');
    expect(formatCurrency(60000.4)).toBe('₹60,000');
  });
});
