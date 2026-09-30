import { formatDuration, formatLateMarks } from './formatters';

/** Maps a month's attendance summary to StatGrid rows, in display order. */
export function getAttendanceStats(attendance) {
  return [
    { id: 'paid-days', label: 'Paid days', value: attendance.paidDays },
    { id: 'present', label: 'Present', value: attendance.presentDays },
    { id: 'absent', label: 'Absent', value: attendance.absentDays },
    { id: 'half-days', label: 'Half days', value: attendance.halfDays },
    { id: 'paid-leave', label: 'Leave (paid)', value: attendance.paidLeaveDays },
    { id: 'unpaid-leave', label: 'Leave without pay', value: attendance.unpaidLeaveDays },
    {
      id: 'late-marks',
      label: 'Late marks',
      value: formatLateMarks(attendance.lateMarks, attendance.lateDeductionDays),
    },
    { id: 'overtime', label: 'Overtime', value: formatDuration(attendance.overtimeMinutes) },
    {
      id: 'offs-holidays',
      label: 'Weekly offs + holidays',
      value: attendance.weeklyOffAndHolidayDays,
    },
  ];
}
