import { UsersPanel } from '@/features/users';

/** User Management, and Role & Permission Management (which opens on the Roles tab). */
export function UsersPage({ initialTab }) {
  return <UsersPanel initialTab={initialTab} />;
}
