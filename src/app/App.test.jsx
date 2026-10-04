import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAuth } from '@/test/renderWithAuth';

import { App } from './App';

describe('App', () => {
  it('starts a Super Admin on the dashboard and marks it as the current page', () => {
    renderWithAuth(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: /^Good \w+, Anita$/ }),
    ).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('button', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('navigates from the sidebar', async () => {
    const user = userEvent.setup();
    renderWithAuth(<App />);

    const nav = screen.getByRole('navigation', { name: 'Main' });
    await user.click(within(nav).getByRole('button', { name: /^Tasks/ }));

    expect(screen.getByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument();
  });

  it('opens Accounting as a sub-menu and keeps the books between its pages', async () => {
    const user = userEvent.setup();
    renderWithAuth(<App />);

    const nav = screen.getByRole('navigation', { name: 'Main' });
    const accounting = within(nav).getByRole('button', { name: 'Accounting' });
    expect(accounting).toHaveAttribute('aria-expanded', 'false');
    await user.click(accounting);
    expect(accounting).toHaveAttribute('aria-expanded', 'true');

    await user.click(within(nav).getByRole('button', { name: 'Manage banks' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Manage banks' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add bank account' }));
    const form = screen.getByRole('form', { name: 'Add bank account' });
    await user.type(within(form).getByLabelText('Account name'), 'ICICI current account');
    await user.type(within(form).getByLabelText('Bank'), 'ICICI Bank');
    await user.type(within(form).getByLabelText('Account number'), '000405012345');
    await user.type(within(form).getByLabelText('IFSC'), 'ICIC0000004');
    await user.click(within(form).getByRole('button', { name: 'Save bank account' }));

    await user.click(within(nav).getByRole('button', { name: 'Bank GL & bank book' }));
    expect(within(nav).getByRole('button', { name: 'Bank GL & bank book' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('option', { name: '1040 · ICICI current account' }),
    ).toBeInTheDocument();
  });

  it('shows the Super Admin role and opens admin-only modules', async () => {
    const user = userEvent.setup();
    renderWithAuth(<App />);

    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    await user.click(within(nav).getByRole('button', { name: 'Audit Logs' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Audit Logs' })).toBeInTheDocument();
  });

  it('shows dashboard figures and jumps to leads from the dashboard', async () => {
    const user = userEvent.setup();
    renderWithAuth(<App />);

    const nav = screen.getByRole('navigation', { name: 'Main' });
    await user.click(within(nav).getByRole('button', { name: 'Dashboard' }));

    expect(
      screen.getByRole('heading', { level: 1, name: /^Good \w+, Anita$/ }),
    ).toBeInTheDocument();
    const attention = screen.getByRole('region', { name: 'Needs attention' });
    expect(within(attention).getByText('Overdue follow-ups')).toBeInTheDocument();
    expect(within(attention).getAllByRole('listitem')).toHaveLength(6);
    const money = screen.getByRole('region', { name: 'Sales & collections' });
    expect(within(money).getByText('₹7,64,631')).toBeInTheDocument();
    // Figures already in the funnel or better suited to Reports stay off the dashboard.
    expect(screen.queryByText('Total leads')).not.toBeInTheDocument();
    expect(screen.queryByText('Inactive merchants')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    const funnel = screen.getByRole('region', { name: 'Sales funnel' });
    expect(within(funnel).getByText('467% of previous')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add lead' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Leads' })).toBeInTheDocument();
  });

  it('opens the merchants list from Merchant Management', async () => {
    const user = userEvent.setup();
    renderWithAuth(<App />);

    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(
      within(nav).queryByRole('button', { name: 'Customer Management' }),
    ).not.toBeInTheDocument();
    await user.click(within(nav).getByRole('button', { name: 'Merchant Management' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Merchants' })).toBeInTheDocument();
    expect(screen.getByText(/^6 merchants, 6 active\./)).toBeInTheDocument();
  });

  it('opens Sales Management from the sidebar', async () => {
    const user = userEvent.setup();
    renderWithAuth(<App />);

    const nav = screen.getByRole('navigation', { name: 'Main' });
    await user.click(within(nav).getByRole('button', { name: 'Sales Management' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Sales Management' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  it('toggles the navigation from the header button', async () => {
    const user = userEvent.setup();
    renderWithAuth(<App />);

    const toggle = screen.getByRole('button', { name: 'Show navigation' });
    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Hide navigation');
  });

  it('navigates from the user menu', async () => {
    const user = userEvent.setup();
    renderWithAuth(<App />);

    await user.click(screen.getByRole('button', { name: 'Anita Deshpande' }));
    const accountMenu = screen.getByRole('list', { name: 'Account' });
    await user.click(within(accountMenu).getByRole('button', { name: 'My HR' }));

    expect(screen.getByRole('heading', { level: 1, name: 'My HR' })).toBeInTheDocument();
  });
});

describe('Signing in', () => {
  async function signIn(user, username, password) {
    await user.type(screen.getByLabelText('Username'), username);
    await user.type(screen.getByLabelText('Password'), password);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
  }

  it('shows the login page first and rejects a wrong password', async () => {
    const user = userEvent.setup();
    renderWithAuth(<App />, { userId: null });

    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
    await signIn(user, 'admin', 'wrong-password');

    expect(screen.getByRole('alert')).toHaveTextContent('Username or password is incorrect.');
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });

  it('signs a Super Admin in to the full app and out again', async () => {
    const user = userEvent.setup();
    renderWithAuth(<App />, { userId: null });

    await signIn(user, 'admin', 'Admin@2026');
    expect(
      screen.getByRole('heading', { level: 1, name: /^Good \w+, Anita$/ }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Anita Deshpande' }));
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
  });

  it('makes a new user set a password, then shows only what their role allows', async () => {
    const user = userEvent.setup();
    renderWithAuth(<App />, { userId: null });

    await signIn(user, 'rohan', 'Welcome@2026');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Set your password' }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText('New password'), 'Rohan2026!');
    await user.type(screen.getByLabelText('Confirm new password'), 'Rohan2026!');
    await user.click(screen.getByRole('button', { name: 'Save password' }));

    // A Sales Executive has no dashboard, so lands on Tasks.
    expect(screen.getByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument();
    expect(screen.getByText('Sales Executive')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('button', { name: /^Lead Management/ })).toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: 'Accounting' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: 'User Management' })).not.toBeInTheDocument();

    await user.click(within(nav).getByRole('button', { name: 'Sales Management' }));
    expect(screen.getByRole('note')).toHaveTextContent(
      'View only: your role (Sales Executive) can see this page',
    );
  });

  it('locks an account after five wrong passwords', async () => {
    const user = userEvent.setup();
    renderWithAuth(<App />, { userId: null });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await signIn(user, 'sneha', 'nope');
      await user.clear(screen.getByLabelText('Username'));
    }
    await signIn(user, 'sneha', 'Welcome@2026');

    expect(screen.getByRole('alert')).toHaveTextContent('This account is locked');
  });

  it('signs in a user added by the Super Admin, and applies role changes straight away', async () => {
    const user = userEvent.setup();
    renderWithAuth(<App />);

    const nav = screen.getByRole('navigation', { name: 'Main' });
    await user.click(within(nav).getByRole('button', { name: 'User Management' }));
    await user.click(screen.getByRole('button', { name: 'Add user' }));
    const form = screen.getByRole('form', { name: 'Add user' });
    await user.type(within(form).getByLabelText('Full name'), 'Kiran More');
    await user.type(within(form).getByLabelText('Email'), 'kiran@finsolis.in');
    await user.type(within(form).getByLabelText('Username'), 'kiran');
    await user.selectOptions(within(form).getByLabelText('Role'), 'accountant');
    await user.click(within(form).getByRole('button', { name: 'Save user' }));
    const notice = screen.getByRole('status', { name: 'Temporary password' });
    const [, password] = notice.textContent.match(/Kiran More: ([A-Za-z0-9]+)/);

    await user.click(screen.getByRole('button', { name: 'Anita Deshpande' }));
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    await signIn(user, 'kiran', password);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Set your password' }),
    ).toBeInTheDocument();
  });
});
