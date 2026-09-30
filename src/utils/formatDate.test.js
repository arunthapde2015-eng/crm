import { addDays, formatDayMonthYear, parseIsoDate, toIsoDate } from './formatDate';

describe('addDays', () => {
  it('rolls over month ends without changing the original', () => {
    const date = new Date(2026, 8, 30);

    expect(toIsoDate(addDays(date, 1))).toBe('2026-10-01');
    expect(toIsoDate(date)).toBe('2026-09-30');
  });
});

describe('formatDayMonthYear', () => {
  it('pads day and month', () => {
    expect(formatDayMonthYear(new Date(2026, 8, 3))).toBe('03-09-2026');
  });
});

describe('toIsoDate / parseIsoDate', () => {
  it('round-trips a local calendar date', () => {
    const date = new Date(2026, 0, 5);

    expect(toIsoDate(date)).toBe('2026-01-05');
    expect(parseIsoDate('2026-01-05')).toEqual(date);
  });
});
