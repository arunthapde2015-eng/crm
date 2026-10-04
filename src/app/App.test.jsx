import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { App } from './App';

describe('App', () => {
  it('starts on Settings and marks it as the current page', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('navigates from the sidebar', async () => {
    const user = userEvent.setup();
    render(<App />);

    const nav = screen.getByRole('navigation', { name: 'Main' });
    await user.click(within(nav).getByRole('button', { name: /^Tasks/ }));

    expect(screen.getByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument();
  });

  it('opens Accounting as a sub-menu and keeps the books between its pages', async () => {
    const user = userEvent.setup();
    render(<App />);

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
    render(<App />);

    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    await user.click(within(nav).getByRole('button', { name: 'Audit Logs' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Audit Logs' })).toBeInTheDocument();
  });

  it('shows dashboard figures and jumps to leads from the dashboard', async () => {
    const user = userEvent.setup();
    render(<App />);

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
    render(<App />);

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
    render(<App />);

    const nav = screen.getByRole('navigation', { name: 'Main' });
    await user.click(within(nav).getByRole('button', { name: 'Sales Management' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Sales Management' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  it('toggles the navigation from the header button', async () => {
    const user = userEvent.setup();
    render(<App />);

    const toggle = screen.getByRole('button', { name: 'Show navigation' });
    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Hide navigation');
  });

  it('navigates from the user menu', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Anita Deshpande' }));
    const accountMenu = screen.getByRole('list', { name: 'Account' });
    await user.click(within(accountMenu).getByRole('button', { name: 'My HR' }));

    expect(screen.getByRole('heading', { level: 1, name: 'My HR' })).toBeInTheDocument();
  });
});
