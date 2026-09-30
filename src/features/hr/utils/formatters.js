import { MINUTES_PER_HOUR } from '../constants';

const timeFormatter = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' });

function padTwo(value) {
  return String(value).padStart(2, '0');
}

/** "02:05 pm" */
export function formatTime(date) {
  return timeFormatter.format(date);
}

/** 1206 → "20h 06m" */
export function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  return `${hours}h ${padTwo(minutes)}m`;
}

/** 4 marks, 0.5 day deducted → "4 (−0.5 day)"; no deduction → "4". */
export function formatLateMarks(count, deductionDays) {
  if (!deductionDays) return String(count);
  const unit = deductionDays > 1 ? 'days' : 'day';
  return `${count} (−${deductionDays} ${unit})`;
}
