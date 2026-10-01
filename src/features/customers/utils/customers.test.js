import {
  CUSTOMER_STATUSES,
  CUSTOMER_TYPES,
  DEFAULT_CUSTOMER_FILTERS,
  INITIAL_CUSTOMERS,
} from '../constants';
import {
  createCustomer,
  setCustomerStatus,
  toCopyFormValues,
  toFormValues,
  updateCustomer,
} from './customerChanges';
import {
  filterCustomers,
  formatLinkedRecords,
  getCustomerStates,
  getCustomerSummary,
} from './customerQueries';

const names = (customers) => customers.map((customer) => customer.name);

describe('filterCustomers', () => {
  it('sorts by name with the default filters', () => {
    const [first, second, third] = names(
      filterCustomers(INITIAL_CUSTOMERS, DEFAULT_CUSTOMER_FILTERS),
    );

    expect([first, second, third]).toEqual([
      'Konkan Fresh Mart',
      'Mauli Nagri Sahakari Patsanstha Marya Majalgaon',
      'Nirmal Co-operative Credit Society',
    ]);
  });

  it('matches GSTIN, customer number and spaced mobile numbers', () => {
    const search = (query) =>
      names(filterCustomers(INITIAL_CUSTOMERS, { ...DEFAULT_CUSTOMER_FILTERS, query }));

    expect(search('30aagfk')).toEqual(['Konkan Fresh Mart']);
    expect(search('CUS-2026-0006')).toEqual(['Mauli Nagri Sahakari Patsanstha Marya Majalgaon']);
    expect(search('98230 10003')).toEqual(['Nirmal Co-operative Credit Society']);
  });

  it('combines type, state and owner filters', () => {
    const filtered = filterCustomers(INITIAL_CUSTOMERS, {
      ...DEFAULT_CUSTOMER_FILTERS,
      type: CUSTOMER_TYPES.INSTITUTION,
      state: 'Maharashtra',
      ownerId: 'rohan',
    });

    expect(filtered).toHaveLength(3);
  });
});

describe('getCustomerSummary', () => {
  it('counts all and active customers', () => {
    const customers = setCustomerStatus(
      INITIAL_CUSTOMERS,
      ['customer-1'],
      CUSTOMER_STATUSES.INACTIVE,
    );

    expect(getCustomerSummary(customers)).toBe('6 customers, 5 active.');
  });
});

describe('formatLinkedRecords', () => {
  it('lists non-zero kinds in a fixed order with plurals', () => {
    expect(formatLinkedRecords({ receipts: 1, merchants: 2, quotations: 1, invoices: 1 })).toBe(
      '2 merchants, 1 quotation, 1 invoice, 1 receipt',
    );
  });

  it('returns an empty string when nothing is linked', () => {
    expect(formatLinkedRecords({})).toBe('');
  });
});

describe('getCustomerStates', () => {
  it('returns unique states alphabetically', () => {
    expect(getCustomerStates(INITIAL_CUSTOMERS)).toEqual(['Goa', 'Karnataka', 'Maharashtra']);
  });
});

describe('createCustomer', () => {
  it('numbers after the highest existing customer and starts empty', () => {
    const customer = createCustomer(
      {
        ...toFormValues(INITIAL_CUSTOMERS[0]),
        name: ' Acme ',
        gstin: '27aaaca1234a1z5',
        ownerId: '',
      },
      INITIAL_CUSTOMERS,
      new Date(2026, 8, 30),
    );

    expect(customer).toMatchObject({
      number: 'CUS-2026-0007',
      name: 'Acme',
      gstin: '27AAACA1234A1Z5',
      ownerId: null,
      totalSales: 0,
      linkedRecords: {},
      status: CUSTOMER_STATUSES.ACTIVE,
    });
  });
});

describe('updateCustomer', () => {
  it('keeps the number and totals', () => {
    const original = INITIAL_CUSTOMERS[3];
    const updated = updateCustomer(original, {
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
    expect(toCopyFormValues(INITIAL_CUSTOMERS[3])).toMatchObject({
      name: 'Konkan Fresh Mart (copy)',
      gstin: '',
      state: 'Goa',
    });
  });
});
