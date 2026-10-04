import { amountInWords } from './amountInWords';

describe('amountInWords', () => {
  it.each([
    [59000, 'FIFTY-NINE THOUSAND RUPEES ONLY'],
    [103545, 'ONE LAKH THREE THOUSAND FIVE HUNDRED FORTY-FIVE RUPEES ONLY'],
    [79760, 'SEVENTY-NINE THOUSAND SEVEN HUNDRED SIXTY RUPEES ONLY'],
    [12, 'TWELVE RUPEES ONLY'],
    [0, 'ZERO RUPEES ONLY'],
    [25000000, 'TWO CRORE FIFTY LAKH RUPEES ONLY'],
    [1500000000, 'ONE HUNDRED FIFTY CRORE RUPEES ONLY'],
    [1250.5, 'ONE THOUSAND TWO HUNDRED FIFTY RUPEES AND FIFTY PAISE ONLY'],
  ])('%d → %s', (amount, words) => {
    expect(amountInWords(amount)).toBe(words);
  });
});
