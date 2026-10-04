import { render } from '@testing-library/react';

import { AuthProvider } from '@/context/AuthContext';

/**
 * Renders UI as a signed-in user, for components that use `useAuth`.
 *
 * @param {React.ReactNode} ui
 * @param {{ userId?: string | null }} [options] - Defaults to the Super Admin, Anita Deshpande.
 */
export function renderWithAuth(ui, { userId = 'admin' } = {}) {
  return render(<AuthProvider initialUserId={userId}>{ui}</AuthProvider>);
}
