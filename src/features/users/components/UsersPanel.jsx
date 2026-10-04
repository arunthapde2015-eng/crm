import { useId, useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Tabs } from '@/components/Tabs';
import { ROLES } from '@/constants/roles';
import { SIGN_IN_EVENTS } from '@/constants/users';
import { useAuth } from '@/context/AuthContext';
import { generateTemporaryPassword } from '@/utils/auth';

import { TABS, TAB_IDS } from '../constants';
import {
  applyUserChanges,
  createUser,
  getEmptyUserValues,
  getUserFormValues,
  resetUserPassword,
} from '../utils/users';
import { ActivityTab } from './ActivityTab';
import { PasswordNotice } from './PasswordNotice';
import { PermissionsTab } from './PermissionsTab';
import { RolesTab } from './RolesTab';
import { UserForm } from './UserForm';
import { UsersTable } from './UsersTable';
import styles from './Users.module.css';

const DESCRIPTION =
  'Everyone signs in on the same page. Each user’s role decides their dashboard, menus and actions. Only a Super Admin can add users, create roles or reset passwords.';

/**
 * Users, roles, what each role can do, and sign-in activity.
 *
 * @param {object} props
 * @param {string} [props.initialTab] - One of TAB_IDS; Role & Permission Management opens Roles.
 * @param {Date} [props.now] - Injectable for tests.
 */
export function UsersPanel({ initialTab = TAB_IDS.USERS, now = new Date() }) {
  const admin = useAuth();
  const [activeTabId, setActiveTabId] = useState(initialTab);
  // The user form: null when closed, { user: null } to add, { user } to edit.
  const [form, setForm] = useState(null);
  const [passwordNotice, setPasswordNotice] = useState(null);
  const [permissionsRoleId, setPermissionsRoleId] = useState(ROLES.SUPER_ADMIN);
  const tabIdPrefix = useId();
  const canManage = admin.currentRole.id === ROLES.SUPER_ADMIN;
  const currentUserId = admin.currentUser.id;
  const by = `by ${admin.currentUser.name}`;

  function openForm(user) {
    setPasswordNotice(null);
    setForm({ user });
    setActiveTabId(TAB_IDS.USERS);
  }

  function handleUserSubmit(values) {
    if (form.user) {
      admin.saveUser(applyUserChanges(form.user, values));
    } else {
      const password = generateTemporaryPassword();
      const user = createUser(values, password);
      admin.saveUser(user, SIGN_IN_EVENTS.USER_ADDED, by, now);
      setPasswordNotice({ userName: user.name, password });
    }
    setForm(null);
  }

  function handleResetPassword(user) {
    setForm(null);
    const password = generateTemporaryPassword();
    admin.saveUser(resetUserPassword(user, password), SIGN_IN_EVENTS.PASSWORD_RESET, by, now);
    setPasswordNotice({ userName: user.name, password });
  }

  function renderTab() {
    switch (activeTabId) {
      case TAB_IDS.ROLES:
        return (
          <RolesTab
            roles={admin.roles}
            users={admin.users}
            canManage={canManage}
            onSaveRole={admin.saveRole}
            onDeleteRole={admin.deleteRole}
            onEditPermissions={(roleId) => {
              setPermissionsRoleId(roleId);
              setActiveTabId(TAB_IDS.PERMISSIONS);
            }}
          />
        );
      case TAB_IDS.PERMISSIONS:
        return (
          <PermissionsTab
            roles={admin.roles}
            roleId={permissionsRoleId}
            onRoleChange={setPermissionsRoleId}
            canManage={canManage}
            onSaveRole={admin.saveRole}
          />
        );
      case TAB_IDS.ACTIVITY:
        return <ActivityTab activity={admin.activity} users={admin.users} />;
      default:
        return (
          <UsersTable
            users={admin.users}
            roles={admin.roles}
            canManage={canManage}
            onEdit={openForm}
            onResetPassword={handleResetPassword}
          />
        );
    }
  }

  return (
    <>
      <PageHeader
        title="Users and permissions"
        description={DESCRIPTION}
        actions={
          canManage && (
            <Button onClick={() => openForm(null)} disabled={form?.user === null}>
              Add user
            </Button>
          )
        }
      />
      <div className={styles.body}>
        {passwordNotice && (
          <PasswordNotice {...passwordNotice} onDone={() => setPasswordNotice(null)} />
        )}
        {form && (
          <UserForm
            key={form.user?.id ?? 'new'}
            editingUser={form.user}
            initialValues={form.user ? getUserFormValues(form.user) : getEmptyUserValues()}
            users={admin.users}
            roles={admin.roles}
            currentUserId={currentUserId}
            onSubmit={handleUserSubmit}
            onCancel={() => setForm(null)}
          />
        )}
        <Tabs
          tabs={TABS}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          label="Users and permissions"
          idPrefix={tabIdPrefix}
        >
          {renderTab()}
        </Tabs>
      </div>
    </>
  );
}
