import { BADGE_TONES, Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';

import { DASHBOARDS, DASHBOARD_LABELS, USER_STATUSES, USER_STATUS_LABELS } from '../constants';
import { findRole, formatSignInTime } from '../utils/users';
import styles from './Users.module.css';

/**
 * @param {object} props
 * @param {object[]} props.users
 * @param {object[]} props.roles
 * @param {boolean} props.canManage - Only a Super Admin sees Edit and Reset password.
 * @param {(user: object) => void} props.onEdit
 * @param {(user: object) => void} props.onResetPassword
 */
export function UsersTable({ users, roles, canManage, onEdit, onResetPassword }) {
  return (
    <DataTable caption="Users" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Username</th>
          <th scope="col">Role</th>
          <th scope="col">Dashboard</th>
          <th scope="col">Last sign-in</th>
          <th scope="col">Status</th>
          {canManage && (
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {users.map((user) => {
          const role = findRole(roles, user.roleId);
          const isActive = user.status === USER_STATUSES.ACTIVE;
          return (
            <tr key={user.id} className={isActive ? undefined : styles.mutedRow}>
              <th scope="row">
                {user.name}
                <span className={styles.subtext}>{user.email}</span>
              </th>
              <td>{user.username}</td>
              <td>{role?.name ?? '—'}</td>
              <td>
                {role && (
                  <Badge
                    tone={
                      role.dashboard === DASHBOARDS.ADMIN ? BADGE_TONES.ACCENT : BADGE_TONES.INFO
                    }
                  >
                    {DASHBOARD_LABELS[role.dashboard]}
                  </Badge>
                )}
              </td>
              <td className={styles.nowrap}>{formatSignInTime(user.lastSignIn)}</td>
              <td>
                <Badge tone={isActive ? BADGE_TONES.SUCCESS : BADGE_TONES.NEUTRAL}>
                  {USER_STATUS_LABELS[user.status]}
                </Badge>
                {user.mustChangePassword && (
                  <span className={styles.subtext}>Must set a new password</span>
                )}
              </td>
              {canManage && (
                <td className={styles.actions}>
                  <Button
                    variant="secondary"
                    aria-label={`Edit ${user.name}`}
                    onClick={() => onEdit(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    aria-label={`Reset password for ${user.name}`}
                    disabled={!isActive}
                    onClick={() => onResetPassword(user)}
                  >
                    Reset password
                  </Button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
