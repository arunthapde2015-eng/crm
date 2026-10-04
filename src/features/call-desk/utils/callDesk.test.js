import { CALL_OUTCOMES, INITIAL_CALL_LOG, INITIAL_QUEUE, QUEUE_CATEGORIES } from '../constants';
import {
  applyCallToQueue,
  createEnquiry,
  getEmptyCallValues,
  getQueueSections,
  getSummary,
  getWhy,
  validateCall,
} from './callDesk';

const NOW = new Date(2026, 9, 4, 10, 30);
const TODAY = '2026-10-04';
const find = (id) => INITIAL_QUEUE.find((item) => item.id === id);

describe('call queue', () => {
  it('groups 16 calls into sections, oldest due first', () => {
    const sections = getQueueSections(INITIAL_QUEUE);
    expect(sections.map((section) => [section.title, section.items.length])).toEqual([
      ['Call-backs due', 2],
      ['Lead follow-ups', 9],
      ['AMC renewal calls', 2],
      ['Payment reminders', 3],
    ]);
    expect(sections[1].items[0].name).toBe('Metro Fitness Studio');
  });

  it('explains why each call is due', () => {
    expect(getWhy(find('cb-sahyadri'), TODAY)).toBe(
      'Call back requested. Last call: not reachable, 27-09-2026',
    );
    expect(getWhy(find('lead-metro'), TODAY)).toBe('Smart POS terminal, ₹25,000. Call planned');
    expect(getWhy(find('amc-sahyadri'), TODAY)).toBe('AMC expired 43 days ago');
    expect(getWhy(find('amc-baner'), TODAY)).toBe('AMC ends in 7 days, renewal invoice unpaid');
    expect(getWhy(find('pay-konkan'), TODAY)).toBe(
      'INV-2026-0004: ₹24,376 overdue since 29-07-2026',
    );
  });

  it("counts only today's calls by this user", () => {
    expect(getSummary(INITIAL_QUEUE, INITIAL_CALL_LOG, TODAY, 'Sneha Patil')).toEqual({
      waiting: 16,
      loggedToday: 0,
      connectedToday: 0,
    });
  });
});

describe('logging a call', () => {
  it('takes a connected call off the queue', () => {
    const item = find('pay-konkan');
    const queue = applyCallToQueue(INITIAL_QUEUE, item, getEmptyCallValues(TODAY, item), TODAY);
    expect(queue).toHaveLength(15);
    expect(queue.some((queued) => queued.id === 'pay-konkan')).toBe(false);
  });

  it('replaces an existing call-back when the contact is not reachable again', () => {
    const item = find('amc-sahyadri');
    const values = {
      ...getEmptyCallValues(TODAY, item),
      outcome: CALL_OUTCOMES.NOT_REACHABLE,
      callbackDate: '2026-10-06',
    };
    const callBacks = applyCallToQueue(INITIAL_QUEUE, item, values, TODAY).filter(
      (queued) => queued.category === QUEUE_CATEGORIES.CALL_BACK,
    );
    expect(callBacks).toHaveLength(2);
    const sahyadri = callBacks.find((queued) => queued.name === 'Sahyadri Clinic, Kothrud');
    expect(sahyadri.due).toBe('2026-10-06');
    expect(getWhy(sahyadri, TODAY)).toBe('Try again. Last call: not reachable, 04-10-2026');
  });

  it('checks the caller and call-back date', () => {
    const values = {
      ...getEmptyCallValues(TODAY),
      phone: '98230',
      outcome: CALL_OUTCOMES.CALL_BACK,
      callbackDate: '2026-10-03',
    };
    expect(validateCall(values, TODAY)).toEqual([
      'Enter who the call was with.',
      'Enter a 10-digit phone number.',
      "The call-back can't be in the past.",
    ]);
  });

  it('turns an enquiry into a lead follow-up due today', () => {
    const { queueItem, logEntry } = createEnquiry(
      {
        name: 'Om Sai Travels',
        phone: '9823010016',
        product: 'Payment links',
        value: '',
        notes: '',
      },
      NOW,
      'Anita Deshpande',
    );
    expect(queueItem).toMatchObject({ category: QUEUE_CATEGORIES.LEAD, due: TODAY });
    expect(getWhy(queueItem, TODAY)).toBe('Payment links. Call planned');
    expect(logEntry).toMatchObject({
      at: '2026-10-04T10:30',
      direction: 'Incoming',
      outcome: CALL_OUTCOMES.CONNECTED,
      notes: 'New enquiry: Payment links',
    });
  });
});
