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

    expect(screen.getByRole('heading', { level: 1, name: 'My Tasks' })).toBeInTheDocument();
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
    const keyFigures = screen.getByRole('region', { name: 'Key figures' });
    expect(within(keyFigures).getByText('₹7,64,631')).toBeInTheDocument();
    const funnel = screen.getByRole('region', { name: 'Sales funnel' });
    expect(within(funnel).getByText('467% of previous')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add lead' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Leads' })).toBeInTheDocument();
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
