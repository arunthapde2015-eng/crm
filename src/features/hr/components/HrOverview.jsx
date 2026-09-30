import { StatGrid } from '@/components/StatGrid';

import { LEAVE_BALANCES, MONTHLY_ATTENDANCE } from '../constants';
import { getAttendanceStats } from '../utils/getAttendanceStats';
import { LeaveBalanceCard } from './LeaveBalanceCard';
import { TodayAttendanceCard } from './TodayAttendanceCard';
import styles from './HrOverview.module.css';

/**
 * @param {object} props
 * @param {() => void} props.onApplyForLeave
 */
export function HrOverview({ onApplyForLeave }) {
  return (
    <div className={styles.overview}>
      <div className={styles.cards}>
        <TodayAttendanceCard />
        <LeaveBalanceCard
          year={new Date().getFullYear()}
          balances={LEAVE_BALANCES}
          onApplyForLeave={onApplyForLeave}
        />
      </div>
      <StatGrid label="This month's attendance" stats={getAttendanceStats(MONTHLY_ATTENDANCE)} />
    </div>
  );
}
