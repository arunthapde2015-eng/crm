export const HR_TAB_IDS = {
  OVERVIEW: 'overview',
  ATTENDANCE: 'attendance',
  LEAVE: 'leave',
  PAYSLIPS: 'payslips',
  LOANS: 'loans',
  PROFILE: 'profile',
};

export const HR_TABS = [
  { id: HR_TAB_IDS.OVERVIEW, label: 'Overview' },
  { id: HR_TAB_IDS.ATTENDANCE, label: 'My attendance' },
  { id: HR_TAB_IDS.LEAVE, label: 'My leave' },
  { id: HR_TAB_IDS.PAYSLIPS, label: 'My payslips' },
  { id: HR_TAB_IDS.LOANS, label: 'My loans' },
  { id: HR_TAB_IDS.PROFILE, label: 'My profile' },
];

export const DEFAULT_HR_TAB_ID = HR_TAB_IDS.OVERVIEW;

// Placeholder figures until the HR/attendance API is wired up.
export const LEAVE_BALANCES = [
  { id: 'casual', label: 'Casual leave', days: 12 },
  { id: 'sick', label: 'Sick leave', days: 8 },
  { id: 'earned', label: 'Earned leave', days: 15 },
];

export const MONTHLY_ATTENDANCE = {
  paidDays: 28,
  presentDays: 23,
  absentDays: 1,
  halfDays: 1,
  paidLeaveDays: 0,
  unpaidLeaveDays: 0,
  lateMarks: 4,
  lateDeductionDays: 0.5,
  overtimeMinutes: 1206,
  weeklyOffAndHolidayDays: 4,
};

export const MINUTES_PER_HOUR = 60;
