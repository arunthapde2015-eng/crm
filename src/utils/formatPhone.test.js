import { formatMobile, getTelHref } from './formatPhone';

describe('formatMobile', () => {
  it('splits a 10-digit number into two groups', () => {
    expect(formatMobile('9823010001')).toBe('98230 10001');
  });
});

describe('getTelHref', () => {
  it('adds the India dialing code', () => {
    expect(getTelHref('9823010001')).toBe('tel:+919823010001');
  });
});
