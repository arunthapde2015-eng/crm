import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAuth } from '@/test/renderWithAuth';

import { UsersPanel } from './UsersPanel';

const NOW = new Date(2026, 9, 4, 14, 5);

function renderPanel(props = {}) {
  const user = userEvent.setup();
  renderWithAuth(<UsersPanel now={NOW} {...props} />);
  return { user };
}

const getRow = (name) =>
  screen.getByRole('rowheader', { name: new RegExp(`^${name}`) }).closest('tr');

describe('Users', () => {
  it('lists users with role, dashboard and last sign-in', () => {
    renderPanel();

    expect(getRow('Anita Deshpande')).toHaveTextContent(
      'Anita Deshpandeanita@finsolis.inadminSuper AdminAdmin Dashboard04-10-2026 12:36Active',
    );
    expect(getRow('Rohan Kulkarni')).toHaveTextContent('Sales ExecutiveStaff DashboardNever');
    expect(screen.getAllByRole('rowheader')).toHaveLength(7);
  });

  it('adds a user and shows their temporary password once', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Add user' }));
    const form = screen.getByRole('form', { name: 'Add user' });
    await user.type(within(form).getByLabelText('Full name'), 'Kiran More');
    await user.type(within(form).getByLabelText('Email'), 'kiran@finsolis.in');
    await user.type(within(form).getByLabelText('Username'), 'kiran');
    await user.selectOptions(within(form).getByLabelText('Role'), 'accountant');
    await user.click(within(form).getByRole('button', { name: 'Save user' }));

    const notice = screen.getByRole('status', { name: 'Temporary password' });
    expect(notice).toHaveTextContent(/^Temporary password for Kiran More: [A-Za-z2-9]{10}/);
    expect(getRow('Kiran More')).toHaveTextContent(
      'AccountantStaff DashboardNeverActiveMust set a new password',
    );
    await user.click(within(notice).getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('status', { name: 'Temporary password' })).toBeNull();

    await user.click(screen.getByRole('tab', { name: 'Sign-in activity' }));
    expect(screen.getAllByRole('row')[1]).toHaveTextContent(
      '04-10-2026 14:05Kiran MorekiranUser addedby Anita Deshpande',
    );
  });

  it("won't let you disable yourself", async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Edit Anita Deshpande' }));
    const form = screen.getByRole('form', { name: 'Edit Anita Deshpande' });
    expect(within(form).getByLabelText('Username')).toBeDisabled();
    await user.selectOptions(within(form).getByLabelText('Status'), 'disabled');
    await user.click(within(form).getByRole('button', { name: 'Save changes' }));

    expect(within(form).getByRole('alert')).toHaveTextContent(
      "You can't remove your own Super Admin access or disable yourself.",
    );
  });

  it('resets a password and logs it', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Reset password for Sneha Patil' }));

    expect(screen.getByRole('status', { name: 'Temporary password' })).toHaveTextContent(
      'Temporary password for Sneha Patil:',
    );
    expect(getRow('Sneha Patil')).toHaveTextContent('Must set a new password');
  });

  it('disables a user, which blocks password resets', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Edit Neha Joshi' }));
    const form = screen.getByRole('form', { name: 'Edit Neha Joshi' });
    await user.selectOptions(within(form).getByLabelText('Status'), 'disabled');
    await user.click(within(form).getByRole('button', { name: 'Save changes' }));

    expect(getRow('Neha Joshi')).toHaveTextContent('Disabled');
    expect(screen.getByRole('button', { name: 'Reset password for Neha Joshi' })).toBeDisabled();
  });
});

describe('Roles and permissions', () => {
  it('opens on Roles for Role & Permission Management', () => {
    renderPanel({ initialTab: 'roles' });

    expect(screen.getByRole('tab', { name: 'Roles' })).toHaveAttribute('aria-selected', 'true');
    expect(getRow('Sales Executive')).toHaveTextContent('Staff Dashboard2');
  });

  it('creates a role from a copy and edits its permissions', async () => {
    const { user } = renderPanel({ initialTab: 'roles' });

    await user.click(screen.getByRole('button', { name: 'Create role' }));
    const form = screen.getByRole('form', { name: 'Create role' });
    await user.type(within(form).getByLabelText('Role name'), 'Field Technician');
    await user.selectOptions(within(form).getByLabelText('Permissions'), 'support-caller');
    await user.click(within(form).getByRole('button', { name: 'Save role' }));

    expect(getRow('Field Technician')).toHaveTextContent('Staff Dashboard0');
    await user.click(screen.getByRole('button', { name: 'Permissions for Field Technician' }));

    expect(screen.getByRole('tab', { name: 'Role permissions' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const callDesk = screen.getByLabelText('Call desk');
    expect(callDesk).toHaveValue('full');
    await user.selectOptions(screen.getByLabelText('Support tickets'), 'view');
    expect(screen.getByLabelText('Support tickets')).toHaveValue('view');
  });

  it('locks Super Admin permissions', async () => {
    const { user } = renderPanel();

    await user.click(screen.getByRole('tab', { name: 'Role permissions' }));

    expect(
      screen.getByText('Super Admin always has full access to everything.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Manage banks')).toBeDisabled();
    expect(screen.getByLabelText('Manage banks')).toHaveValue('full');
  });
});
