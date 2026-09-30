import { Button } from '@/components/Button';

import { HrCard } from './HrCard';
import styles from './LeaveBalanceCard.module.css';

/**
 * @param {object} props
 * @param {number} props.year
 * @param {Array<{ id: string, label: string, days: number }>} props.balances
 * @param {() => void} props.onApplyForLeave
 */
export function LeaveBalanceCard({ year, balances, onApplyForLeave }) {
  return (
    <HrCard title={`Leave balance ${year}`}>
      <dl className={styles.list}>
        {balances.map((balance) => (
          <div key={balance.id} className={styles.row}>
            <dt>{balance.label}</dt>
            <dd className={styles.days}>{balance.days}</dd>
          </div>
        ))}
      </dl>
      <Button onClick={onApplyForLeave}>Apply for leave</Button>
    </HrCard>
  );
}
