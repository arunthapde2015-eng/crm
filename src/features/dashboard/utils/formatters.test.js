import { STAT_FORMATS } from '../constants';
import { formatLongDate, formatStatValue, getConversionPercent, getGreeting } from './formatters';

describe('formatStatValue', () => {
  it('formats currency with Indian digit grouping and no decimals', () => {
    expect(formatStatValue(764631, STAT_FORMATS.CURRENCY)).toBe('₹7,64,631');
  });

  it('formats plain numbers by default', () => {
    expect(formatStatValue(18)).toBe('18');
  });
});

describe('formatLongDate', () => {
  it('includes the weekday, day, month and year', () => {
    expect(formatLongDate(new Date(2026, 8, 30))).toBe('Wednesday, 30 September 2026');
  });
});

describe('getGreeting', () => {
  it.each([
    [9, 'Good morning'],
    [14, 'Good afternoon'],
    [19, 'Good evening'],
  ])('greets at %i:00 with "%s"', (hour, greeting) => {
    expect(getGreeting(new Date(2026, 8, 30, hour))).toBe(greeting);
  });
});

describe('getConversionPercent', () => {
  it('rounds to a whole percentage of the previous stage', () => {
    expect(getConversionPercent(2, 18)).toBe(11);
    expect(getConversionPercent(14, 3)).toBe(467);
  });

  it('returns null without a previous stage', () => {
    expect(getConversionPercent(18, undefined)).toBeNull();
    expect(getConversionPercent(5, 0)).toBeNull();
  });
});
