import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { USER_STATUS_LABELS } from '@/constants/users';

import { validateUser } from '../utils/users';
import styles from './Users.module.css';

const STATUS_OPTIONS = Object.entries(USER_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/**
 * Adds a user, or edits one. The username is fixed once the user exists.
 *
 * @param {object} props
 * @param {object | null} props.editingUser - The user being edited, or null to add one.
 * @param {object} props.initialValues
 * @param {object[]} props.users
 * @param {object[]} props.roles
 * @param {string} props.currentUserId - So you can't lock yourself out.
 * @param {(values: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export function UserForm({
  editingUser,
  initialValues,
  users,
  roles,
  currentUserId,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const nameRef = useRef(null);
  const title = editingUser ? `Edit ${editingUser.name}` : 'Add user';
  const roleOptions = [
    { value: '', label: 'Choose a role' },
    ...roles.map((role) => ({ value: role.id, label: role.name })),
  ];

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function getFieldProps(name) {
    return {
      id: `user-form-${name}`,
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
    const validationErrors = validateUser(values, users, roles, { editingUser, currentUserId });
    setErrors(validationErrors);
    if (validationErrors.length === 0) onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label={title}>
      <h2 className={styles.formTitle}>{title}</h2>
      <div className={styles.grid}>
        <TextField ref={nameRef} label="Full name" required {...getFieldProps('name')} />
        <TextField label="Email" type="email" required {...getFieldProps('email')} />
        <TextField
          label="Username"
          required
          disabled={Boolean(editingUser)}
          autoComplete="off"
          {...getFieldProps('username')}
        />
        <SelectField label="Role" options={roleOptions} {...getFieldProps('roleId')} />
        {editingUser && (
          <SelectField label="Status" options={STATUS_OPTIONS} {...getFieldProps('status')} />
        )}
      </div>
      {!editingUser && (
        <p className={styles.formNote}>
          A temporary password is created when you save. They set their own at first sign-in.
        </p>
      )}
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
        <Button type="submit">{editingUser ? 'Save changes' : 'Save user'}</Button>
      </div>
    </form>
  );
}
