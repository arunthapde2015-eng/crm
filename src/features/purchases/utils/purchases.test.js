import { INITIAL_BILLS, INITIAL_VENDORS } from '../constants';
import {
  createBill,
  createVendor,
  getBillTotal,
  getEmptyBillValues,
  getEmptyPaymentValues,
  getEmptyVendorValues,
  getPayable,
  getVendorRows,
  payBill,
  validateBill,
  validatePayment,
  validateVendor,
} from './purchases';

const TODAY = new Date(2026, 9, 3);
const TODAY_ISO = '2026-10-03';
const [UNPAID_BILL] = INITIAL_BILLS;

describe('purchase figures', () => {
  it('owes the totals of unpaid bills', () => {
    expect(getBillTotal(UNPAID_BILL)).toBe(63720);
    expect(getPayable(INITIAL_BILLS)).toBe(63720);
  });

  it('sums each vendor', () => {
    expect(getVendorRows(INITIAL_VENDORS, INITIAL_BILLS)[0]).toMatchObject({
      name: 'Axis Devices Pvt. Ltd.',
      billCount: 2,
      purchased: 169920,
      payable: 63720,
    });
  });
});

describe('bills', () => {
  const values = {
    ...getEmptyBillValues(TODAY, 'axis-devices'),
    vendorBillNumber: 'adpl/2026/402',
    description: 'Card readers',
    amount: '1000',
  };

  it("won't take the same vendor bill twice", () => {
    expect(validateBill(values, INITIAL_BILLS, INITIAL_VENDORS, TODAY_ISO)).toEqual([
      'Bill adpl/2026/402 from Axis Devices Pvt. Ltd. is already entered as PUR-2026-0002.',
    ]);
    expect(
      validateBill(
        { ...values, vendorId: 'matrix-rolls', date: '2026-10-05' },
        INITIAL_BILLS,
        INITIAL_VENDORS,
        TODAY_ISO,
      ),
    ).toEqual(["The bill date can't be in the future."]);
  });

  it('numbers new bills by financial year, unpaid', () => {
    expect(
      createBill({ ...values, vendorBillNumber: 'ADPL/2026/455' }, INITIAL_BILLS),
    ).toMatchObject({ number: 'PUR-2026-0003', amount: 1000, status: 'unpaid', payment: null });
  });
});

describe('paying', () => {
  it('checks the date and reference', () => {
    const payment = { ...getEmptyPaymentValues(TODAY), date: '2026-09-01' };
    expect(validatePayment(payment, UNPAID_BILL, INITIAL_BILLS, TODAY_ISO)).toEqual([
      "The payment can't be before the bill date, 12-09-2026.",
      'Enter the UTR, transaction ID or cheque number.',
    ]);
    expect(
      validatePayment(
        { ...payment, date: TODAY_ISO, reference: 'utr719260318' },
        UNPAID_BILL,
        INITIAL_BILLS,
        TODAY_ISO,
      ),
    ).toEqual(['Reference utr719260318 is already used on PUR-2026-0001.']);
  });

  it('marks the bill paid', () => {
    const paid = payBill(UNPAID_BILL, { date: TODAY_ISO, mode: 'UPI', reference: ' UTR1 ' });
    expect(paid).toMatchObject({ status: 'paid', payment: { date: TODAY_ISO, reference: 'UTR1' } });
    expect(getPayable([paid])).toBe(0);
  });
});

describe('vendors', () => {
  const values = { ...getEmptyVendorValues(), name: 'Shree Ganesh Electronics' };

  it('checks name, GSTIN and contact details', () => {
    expect(
      validateVendor(
        { ...values, name: 'axis devices pvt. ltd.', mobile: '123', email: 'x@' },
        INITIAL_VENDORS,
      ),
    ).toEqual([
      'axis devices pvt. ltd. is already a vendor.',
      'Enter a 10-digit mobile number.',
      'Enter a valid email address.',
    ]);
    expect(validateVendor({ ...values, gstin: '27ABC' }, INITIAL_VENDORS)).toEqual([
      'Enter a valid 15-character GSTIN.',
    ]);
    expect(validateVendor({ ...values, gstin: '30aagfk4444n1z1' }, INITIAL_VENDORS)).toEqual([
      'This GSTIN is not registered in Maharashtra.',
    ]);
  });

  it('creates a vendor with a unique id', () => {
    expect(createVendor({ ...values, gstin: ' 27aagfk4444n1z1 ' }, INITIAL_VENDORS)).toMatchObject({
      id: 'shree-ganesh-electronics',
      gstin: '27AAGFK4444N1Z1',
    });
  });
});
