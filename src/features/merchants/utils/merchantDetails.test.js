import { INITIAL_MERCHANTS, MERCHANT_STATUSES } from '../constants';
import {
  addOutlet,
  addRemark,
  getAccountSummary,
  getDeleteBlocker,
  getLifecycleStages,
  getLinkedCounts,
  getTimelineEvents,
  getToggledStatus,
} from './merchantDetails';

const [vidya, , , konkan, , mauli] = INITIAL_MERCHANTS;

const doneStageLabels = (merchant) =>
  getLifecycleStages(merchant)
    .filter((stage) => stage.isDone)
    .map((stage) => stage.label);

describe('getLifecycleStages', () => {
  it('ticks only the stages the merchant has records for', () => {
    expect(doneStageLabels(mauli)).toEqual(['Merchant', 'Quotation', 'Proforma']);
    expect(doneStageLabels(vidya)).toEqual([
      'Lead',
      'Merchant',
      'Quotation',
      'Invoice',
      'Payment',
      'AMC',
    ]);
  });
});

describe('getLinkedCounts', () => {
  it('counts outlets from the outlet list', () => {
    expect(getLinkedCounts(konkan)).toMatchObject({ outlets: 2, invoices: 1 });
    expect(getLinkedCounts(addOutlet(mauli, 'Majalgaon Branch')).outlets).toBe(1);
  });
});

describe('getDeleteBlocker', () => {
  it('blocks deleting merchants with invoices or receipts', () => {
    expect(getDeleteBlocker(konkan)).toMatch(/only be deactivated/);
    expect(getDeleteBlocker(mauli)).toBeNull();
  });
});

describe('getAccountSummary', () => {
  it('derives the amount received from sales and outstanding', () => {
    expect(getAccountSummary(konkan)).toEqual({
      invoiced: 82076,
      received: 57700,
      outstanding: 24376,
    });
  });
});

describe('getToggledStatus', () => {
  it('flips between active and inactive', () => {
    expect(getToggledStatus(konkan)).toBe(MERCHANT_STATUSES.INACTIVE);
    expect(getToggledStatus({ ...konkan, status: MERCHANT_STATUSES.INACTIVE })).toBe(
      MERCHANT_STATUSES.ACTIVE,
    );
  });
});

describe('getTimelineEvents', () => {
  it('lists remarks, outlets and creation, newest first', () => {
    const withRemark = addRemark(
      mauli,
      '  Board meeting on Friday ',
      'Anita',
      new Date(2026, 9, 2),
    );

    expect(getTimelineEvents(withRemark)).toEqual([
      expect.objectContaining({
        text: 'Board meeting on Friday',
        date: '2026-10-02',
        detail: 'Remark by Anita',
      }),
      expect.objectContaining({ text: 'Merchant created', date: '2026-09-25' }),
    ]);
  });
});
