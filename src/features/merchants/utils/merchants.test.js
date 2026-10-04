import {
  MERCHANT_STATUSES,
  MERCHANT_TYPES,
  DEFAULT_MERCHANT_FILTERS,
  INITIAL_MERCHANTS,
} from '../constants';
import {
  createMerchant,
  setMerchantStatus,
  toCopyFormValues,
  toFormValues,
  updateMerchant,
} from './merchantChanges';
import {
  filterMerchants,
  formatLinkedRecords,
  getMerchantStates,
  getMerchantSummary,
} from './merchantQueries';

const names = (merchants) => merchants.map((merchant) => merchant.name);

describe('filterMerchants', () => {
  it('sorts by name with the default filters', () => {
    const [first, second, third] = names(
      filterMerchants(INITIAL_MERCHANTS, DEFAULT_MERCHANT_FILTERS),
    );

    expect([first, second, third]).toEqual([
      'Konkan Fresh Mart',
      'Mauli Nagri Sahakari Patsanstha Marya Majalgaon',
      'Nirmal Co-operative Credit Society',
    ]);
  });

  it('matches GSTIN, merchant number and spaced mobile numbers', () => {
    const search = (query) =>
      names(filterMerchants(INITIAL_MERCHANTS, { ...DEFAULT_MERCHANT_FILTERS, query }));

    expect(search('30aagfk')).toEqual(['Konkan Fresh Mart']);
    expect(search('MER-2026-0006')).toEqual(['Mauli Nagri Sahakari Patsanstha Marya Majalgaon']);
    expect(search('98230 10003')).toEqual(['Nirmal Co-operative Credit Society']);
  });

  it('combines type, state and owner filters', () => {
    const filtered = filterMerchants(INITIAL_MERCHANTS, {
      ...DEFAULT_MERCHANT_FILTERS,
      type: MERCHANT_TYPES.INSTITUTION,
      state: 'Maharashtra',
      ownerId: 'rohan',
    });

    expect(filtered).toHaveLength(3);
  });
});

describe('getMerchantSummary', () => {
  it('counts all and active merchants', () => {
    const merchants = setMerchantStatus(
      INITIAL_MERCHANTS,
      ['merchant-1'],
      MERCHANT_STATUSES.INACTIVE,
    );

    expect(getMerchantSummary(merchants)).toBe('6 merchants, 5 active.');
  });
});

describe('formatLinkedRecords', () => {
  it('lists non-zero kinds in a fixed order with plurals', () => {
    expect(formatLinkedRecords({ receipts: 1, outlets: 2, quotations: 1, invoices: 1 })).toBe(
      '2 outlets, 1 quotation, 1 invoice, 1 receipt',
    );
  });

  it('returns an empty string when nothing is linked', () => {
    expect(formatLinkedRecords({})).toBe('');
  });
});

describe('getMerchantStates', () => {
  it('returns unique states alphabetically', () => {
    expect(getMerchantStates(INITIAL_MERCHANTS)).toEqual(['Goa', 'Karnataka', 'Maharashtra']);
  });
});

describe('createMerchant', () => {
  it('numbers after the highest existing merchant and starts empty', () => {
    const merchant = createMerchant(
      {
        ...toFormValues(INITIAL_MERCHANTS[0]),
        name: ' Acme ',
        gstin: '27aaaca1234a1z5',
        ownerId: '',
      },
      INITIAL_MERCHANTS,
      new Date(2026, 8, 30),
    );

    expect(merchant).toMatchObject({
      number: 'MER-2026-0007',
      name: 'Acme',
      gstin: '27AAACA1234A1Z5',
      ownerId: null,
      totalSales: 0,
      linkedRecords: {},
      status: MERCHANT_STATUSES.ACTIVE,
    });
  });
});

describe('updateMerchant', () => {
  it('keeps the number and totals', () => {
    const original = INITIAL_MERCHANTS[3];
    const updated = updateMerchant(original, {
      ...toFormValues(original),
      contactName: 'New Contact',
    });

    expect(updated).toMatchObject({
      number: original.number,
      totalSales: original.totalSales,
      contactName: 'New Contact',
    });
  });
});

describe('toCopyFormValues', () => {
  it('marks the name as a copy and clears the GSTIN', () => {
    expect(toCopyFormValues(INITIAL_MERCHANTS[3])).toMatchObject({
      name: 'Konkan Fresh Mart (copy)',
      gstin: '',
      state: 'Goa',
    });
  });
});
