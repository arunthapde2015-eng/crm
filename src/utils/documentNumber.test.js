import { getFinancialYear, getNextDocumentNumber } from './documentNumber';

describe('document numbers', () => {
  it('works out the Indian financial year', () => {
    expect(getFinancialYear('2026-03-31')).toBe(2025);
    expect(getFinancialYear('2026-04-01')).toBe(2026);
  });

  it('counts up within the financial year and restarts each April', () => {
    const numbers = ['EXP-2025-0007', 'EXP-2026-0002', 'EXP-2026-0011', 'REC-2026-0040'];
    expect(getNextDocumentNumber(numbers, 'EXP', '2026-10-03')).toBe('EXP-2026-0012');
    expect(getNextDocumentNumber(numbers, 'EXP', '2026-02-10')).toBe('EXP-2025-0008');
    expect(getNextDocumentNumber(numbers, 'EXP', '2027-04-01')).toBe('EXP-2027-0001');
  });
});
