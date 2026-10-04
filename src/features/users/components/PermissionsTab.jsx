import { SelectField } from '@/components/SelectField';

import { ACCESS_LEVEL_LABELS, SUPER_ADMIN_ROLE_ID } from '../constants';
import { findRole, getAccessLevel, getModules, setAccessLevel } from '../utils/users';
import styles from './Users.module.css';

const ACCESS_OPTIONS = Object.entries(ACCESS_LEVEL_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function groupBySection(modules) {
  return modules.reduce((sections, module) => {
    const section = sections.find((item) => item.name === module.section);
    if (section) section.modules.push(module);
    else sections.push({ name: module.section, modules: [module] });
    return sections;
  }, []);
}

/**
 * What one role can open and do, module by module. Super Admin is always full access.
 *
 * @param {object} props
 * @param {object[]} props.roles
 * @param {string} props.roleId - The role being shown.
 * @param {(roleId: string) => void} props.onRoleChange
 * @param {boolean} props.canManage
 * @param {(role: object) => void} props.onSaveRole
 */
export function PermissionsTab({ roles, roleId, onRoleChange, canManage, onSaveRole }) {
  const role = findRole(roles, roleId) ?? roles[0];
  const isLocked = !canManage || role.id === SUPER_ADMIN_ROLE_ID;

  return (
    <div className={styles.body}>
      <div className={styles.roleChooser}>
        <SelectField
          id="permissions-role"
          label="Role"
          options={roles.map((item) => ({ value: item.id, label: item.name }))}
          value={role.id}
          onChange={(event) => onRoleChange(event.target.value)}
        />
      </div>
      {role.id === SUPER_ADMIN_ROLE_ID && (
        <p className={styles.formNote}>Super Admin always has full access to everything.</p>
      )}
      <div className={styles.permissionSections}>
        {groupBySection(getModules()).map((section) => (
          <fieldset key={section.name} className={styles.fieldset} disabled={isLocked}>
            <legend className={styles.legend}>{section.name}</legend>
            {section.modules.map((module) => (
              <SelectField
                key={module.id}
                id={`permission-${role.id}-${module.id}`}
                label={module.label}
                className={styles.permissionRow}
                options={ACCESS_OPTIONS}
                value={getAccessLevel(role, module.id)}
                onChange={(event) =>
                  onSaveRole(setAccessLevel(role, module.id, event.target.value))
                }
              />
            ))}
          </fieldset>
        ))}
      </div>
    </div>
  );
}
