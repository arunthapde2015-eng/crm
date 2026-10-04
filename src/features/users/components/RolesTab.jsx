import { useState } from 'react';

import { BADGE_TONES, Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';

import { DASHBOARDS, DASHBOARD_LABELS, MAX_DESCRIPTION_LENGTH } from '../constants';
import {
  countModulesWithAccess,
  countUsers,
  createRole,
  getDeleteRoleBlocker,
  getEmptyRoleValues,
  validateRole,
} from '../utils/users';
import styles from './Users.module.css';

const DASHBOARD_OPTIONS = Object.entries(DASHBOARD_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function RoleForm({ roles, onSubmit, onCancel }) {
  const [values, setValues] = useState(getEmptyRoleValues);
  const [errors, setErrors] = useState([]);
  const copyOptions = [
    { value: '', label: 'Start with no access' },
    ...roles.map((role) => ({ value: role.id, label: `Copy ${role.name}` })),
  ];

  function getFieldProps(name) {
    return {
      id: `role-form-${name}`,
      name,
      value: values[name],
      onChange: (event) => {
        setValues((previous) => ({ ...previous, [name]: event.target.value }));
        setErrors([]);
      },
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateRole(values, roles);
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(createRole(values, roles));
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="role-form-title">
      <h2 id="role-form-title" className={styles.formTitle}>
        Create role
      </h2>
      <div className={styles.grid}>
        <TextField label="Role name" required {...getFieldProps('name')} />
        <SelectField
          label="Dashboard"
          options={DASHBOARD_OPTIONS}
          {...getFieldProps('dashboard')}
        />
        <SelectField label="Permissions" options={copyOptions} {...getFieldProps('copyFromId')} />
        <TextField
          label="Description (optional)"
          maxLength={MAX_DESCRIPTION_LENGTH}
          {...getFieldProps('description')}
        />
      </div>
      {errors.length > 0 && (
        <ul className={styles.errors} role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save role</Button>
      </div>
    </form>
  );
}

/**
 * Every role with its dashboard, how many users have it and how many modules it opens.
 *
 * @param {object} props
 * @param {object[]} props.roles
 * @param {object[]} props.users
 * @param {boolean} props.canManage
 * @param {(role: object) => void} props.onSaveRole
 * @param {(roleId: string) => void} props.onDeleteRole
 * @param {(roleId: string) => void} props.onEditPermissions
 */
export function RolesTab({ roles, users, canManage, onSaveRole, onDeleteRole, onEditPermissions }) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className={styles.body}>
      {canManage && !isFormOpen && (
        <div>
          <Button onClick={() => setIsFormOpen(true)}>Create role</Button>
        </div>
      )}
      {isFormOpen && (
        <RoleForm
          roles={roles}
          onSubmit={(role) => {
            onSaveRole(role);
            setIsFormOpen(false);
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
      <DataTable caption="Roles" tableClassName={styles.table}>
        <thead>
          <tr>
            <th scope="col">Role</th>
            <th scope="col">Dashboard</th>
            <th scope="col" className={styles.numeric}>
              Users
            </th>
            <th scope="col" className={styles.numeric}>
              Modules
            </th>
            {canManage && (
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => {
            const deleteBlocker = getDeleteRoleBlocker(role, users);
            return (
              <tr key={role.id}>
                <th scope="row">
                  {role.name}
                  {role.description && <span className={styles.subtext}>{role.description}</span>}
                </th>
                <td>
                  <Badge
                    tone={
                      role.dashboard === DASHBOARDS.ADMIN ? BADGE_TONES.ACCENT : BADGE_TONES.INFO
                    }
                  >
                    {DASHBOARD_LABELS[role.dashboard]}
                  </Badge>
                </td>
                <td className={styles.numeric}>{countUsers(users, role.id)}</td>
                <td className={styles.numeric}>{countModulesWithAccess(role)}</td>
                {canManage && (
                  <td className={styles.actions}>
                    <Button
                      variant="secondary"
                      aria-label={`Permissions for ${role.name}`}
                      onClick={() => onEditPermissions(role.id)}
                    >
                      Permissions
                    </Button>
                    {!role.isSystem && (
                      <Button
                        variant="secondary"
                        aria-label={`Delete ${role.name}`}
                        disabled={Boolean(deleteBlocker)}
                        onClick={() => onDeleteRole(role.id)}
                      >
                        Delete
                      </Button>
                    )}
                    {!role.isSystem && deleteBlocker && (
                      <span className={styles.subtext}>{deleteBlocker}</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </DataTable>
    </div>
  );
}
