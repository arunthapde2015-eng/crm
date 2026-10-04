import { BADGE_TONES, Badge } from '@/components/Badge';
import { DataTable } from '@/components/DataTable';
import { SIGN_IN_EVENTS } from '@/constants/users';

import { findUser, formatSignInTime } from '../utils/users';
import styles from './Users.module.css';

const EVENT_TONES = {
  [SIGN_IN_EVENTS.SIGNED_IN]: BADGE_TONES.SUCCESS,
  [SIGN_IN_EVENTS.FAILED]: BADGE_TONES.DANGER,
  [SIGN_IN_EVENTS.PASSWORD_RESET]: BADGE_TONES.WARNING,
  [SIGN_IN_EVENTS.USER_ADDED]: BADGE_TONES.INFO,
  [SIGN_IN_EVENTS.SIGNED_OUT]: BADGE_TONES.NEUTRAL,
  [SIGN_IN_EVENTS.LOCKED]: BADGE_TONES.DANGER,
  [SIGN_IN_EVENTS.PASSWORD_CHANGED]: BADGE_TONES.SUCCESS,
};

/**
 * Sign-ins, failed attempts and account changes, newest first.
 *
 * @param {object} props
 * @param {object[]} props.activity
 * @param {object[]} props.users
 */
export function ActivityTab({ activity, users }) {
  return (
    <DataTable caption="Sign-in activity" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">When</th>
          <th scope="col">User</th>
          <th scope="col">Event</th>
          <th scope="col">Details</th>
        </tr>
      </thead>
      <tbody>
        {activity.map((entry) => {
          const user = findUser(users, entry.userId);
          return (
            <tr key={entry.id}>
              <td className={styles.nowrap}>{formatSignInTime(entry.at)}</td>
              <th scope="row">
                {user?.name ?? entry.userId}
                <span className={styles.subtext}>{entry.userId}</span>
              </th>
              <td>
                <Badge tone={EVENT_TONES[entry.event]}>{entry.event}</Badge>
              </td>
              <td>{entry.detail}</td>
            </tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
