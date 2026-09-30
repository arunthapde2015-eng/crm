import { formatDuration, formatLateMarks } from './formatters';

describe('formatDuration', () => {
  it('splits minutes into hours and zero-padded minutes', () => {
    expect(formatDuration(1206)).toBe('20h 06m');
    expect(formatDuration(45)).toBe('0h 45m');
  });
});

describe('formatLateMarks', () => {
  it('shows the deduction when there is one', () => {
    expect(formatLateMarks(4, 0.5)).toBe('4 (−0.5 day)');
    expect(formatLateMarks(8, 2)).toBe('8 (−2 days)');
  });

  it('shows just the count without a deduction', () => {
    expect(formatLateMarks(1, 0)).toBe('1');
  });
});
