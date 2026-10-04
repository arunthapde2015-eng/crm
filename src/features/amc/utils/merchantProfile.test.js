import { INITIAL_CONTRACTS } from '../constants';
import {
  getLatestRemark,
  getLedger,
  getLifecycleStages,
  getReminderSchedule,
  getTimelineEvents,
  validateProfile,
} from './merchantProfile';

const TODAY = '2026-10-03';
const find = (code) => INITIAL_CONTRACTS.find((contract) => contract.merchantCode === code);
const SAHYADRI = find('MER-2025-0002');
const BANER = find('MER-2025-0001');

const doneStages = (contract) =>
  getLifecycleStages(contract, TODAY)
    .filter((stage) => stage.isDone)
    .map((stage) => stage.label);

describe('merchant profile', () => {
  it('stops the lifecycle at onboarded when the AMC has expired', () => {
    expect(doneStages(SAHYADRI)).toEqual(['Customer', 'Documents', 'Verified', 'Onboarded']);
    expect(doneStages(BANER)).toEqual([
      'Customer',
      'Documents',
      'Verified',
      'Onboarded',
      'AMC active',
      'Renewal billed',
    ]);
  });

  it('keeps a running balance with invoices before same-day payments', () => {
    const ledger = getLedger(SAHYADRI);
    expect(ledger.rows.map((row) => row.balance)).toEqual([59000, 80240, 59000, 0]);
    expect(getLedger(BANER)).toMatchObject({ debit: 80240, credit: 49560, balance: 30680 });
  });

  it('schedules reminders back from the expiry date', () => {
    const schedule = getReminderSchedule(BANER, TODAY);
    expect(schedule.map((reminder) => [reminder.date, reminder.isSent])).toEqual([
      ['2026-07-13', true],
      ['2026-08-12', true],
      ['2026-09-11', true],
      ['2026-09-26', true],
      ['2026-10-04', false],
      ['2026-10-11', false],
    ]);
  });

  it('lists events newest first and shows the latest remark', () => {
    expect(getTimelineEvents(BANER)[0].text).toBe(
      'AMC invoice AMC-2026-0002 raised for 12-10-2026 to 11-10-2027.',
    );
    expect(getLatestRemark(BANER)).toBe(
      'Renewal quoted at ₹26,000 for the added fee-reminder module.',
    );
    expect(getLatestRemark(SAHYADRI)).toBe('');
  });

  it('checks contact details', () => {
    const values = {
      contactName: ' ',
      mobile: '98230',
      email: 'not-an-email',
      address: 'Pune',
      product: 'Gateway',
      assignedTo: 'sneha',
    };
    expect(validateProfile(values)).toEqual([
      'Enter the contact person.',
      'Enter a 10-digit mobile number.',
      'Enter a valid email address.',
    ]);
  });
});
