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
