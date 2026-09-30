import { FOLLOW_UP_TYPES, INITIAL_FOLLOW_UPS } from '../constants';
import { applyFollowUpLog, getFollowUpSummary, groupFollowUps } from './followUps';

const TODAY = new Date(2026, 8, 30);

function leadNamesByGroup(groups) {
  return Object.fromEntries(
    groups.map((group) => [group.id, group.followUps.map((item) => item.leadName)]),
  );
}

describe('groupFollowUps', () => {
  it('splits by due date relative to today', () => {
    expect(leadNamesByGroup(groupFollowUps(INITIAL_FOLLOW_UPS, TODAY))).toEqual({
      overdue: ['Metro Fitness Studio', 'Sai Krupa Diagnostics'],
      today: ['Deccan Institute of Management', 'City Care Pharmacy'],
      tomorrow: ['Green Leaf Organic Store', 'Royal Caterers'],
      later: ['Bluebell Montessori', 'Shivneri Urban Credit Society'],
    });
  });

  it('orders by date then time within a group', () => {
    const followUps = [
      { id: 'b', leadName: 'B', dueDate: '2026-09-30', dueTime: '15:00' },
      { id: 'a', leadName: 'A', dueDate: '2026-09-30', dueTime: '09:00' },
    ];

    expect(leadNamesByGroup(groupFollowUps(followUps, TODAY)).today).toEqual(['A', 'B']);
  });

  it('treats the 1st of next month as tomorrow at month end', () => {
    const followUps = [{ id: 'x', leadName: 'X', dueDate: '2026-10-01', dueTime: '10:00' }];

    expect(leadNamesByGroup(groupFollowUps(followUps, TODAY)).tomorrow).toEqual(['X']);
  });
});

describe('getFollowUpSummary', () => {
  it('counts overdue and due-today follow-ups', () => {
    expect(getFollowUpSummary(groupFollowUps(INITIAL_FOLLOW_UPS, TODAY))).toBe(
      '2 overdue, 2 due today.',
    );
  });
});

describe('applyFollowUpLog', () => {
  it('replaces the discussion, type and next date', () => {
    const updated = applyFollowUpLog(INITIAL_FOLLOW_UPS[0], {
      type: FOLLOW_UP_TYPES.MEETING,
      discussion: '  Agreed to a demo  ',
      nextDate: '2026-10-03',
      nextTime: '16:00',
    });

    expect(updated).toMatchObject({
      leadName: 'Metro Fitness Studio',
      type: FOLLOW_UP_TYPES.MEETING,
      lastDiscussion: 'Agreed to a demo',
      dueDate: '2026-10-03',
      dueTime: '16:00',
    });
  });
});
