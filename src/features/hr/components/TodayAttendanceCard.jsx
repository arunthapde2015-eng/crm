import { Button } from '@/components/Button';
import { formatDayMonthYear } from '@/utils/formatDate';

import { useTodayCheckIn } from '../hooks/useTodayCheckIn';
import { formatTime } from '../utils/formatters';
import { HrCard } from './HrCard';
import styles from './TodayAttendanceCard.module.css';

export function TodayAttendanceCard() {
  const { checkedInAt, checkIn } = useTodayCheckIn();

  return (
    <HrCard title={`Today, ${formatDayMonthYear(new Date())}`}>
      <p className={styles.status} role="status">
        {checkedInAt
          ? `You checked in at ${formatTime(checkedInAt)}.`
          : 'You haven’t checked in yet.'}
      </p>
      {!checkedInAt && <Button onClick={checkIn}>Check in now</Button>}
    </HrCard>
  );
}
