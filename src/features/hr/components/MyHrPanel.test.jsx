import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MyHrPanel } from './MyHrPanel';

describe('MyHrPanel', () => {
  it('opens on the overview with leave balances and attendance figures', () => {
    render(<MyHrPanel />);

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    const leave = screen.getByRole('region', { name: /^Leave balance \d{4}$/ });
    expect(within(leave).getByText('Casual leave')).toBeInTheDocument();
    const attendance = screen.getByRole('region', { name: "This month's attendance" });
    expect(within(attendance).getByText('4 (−0.5 day)')).toBeInTheDocument();
    expect(within(attendance).getByText('20h 06m')).toBeInTheDocument();
  });

  it('records a check-in for today', async () => {
    const user = userEvent.setup();
    render(<MyHrPanel />);

    expect(screen.getByRole('status')).toHaveTextContent('You haven’t checked in yet.');
    await user.click(screen.getByRole('button', { name: 'Check in now' }));

    expect(screen.getByRole('status')).toHaveTextContent(/^You checked in at /);
    expect(screen.queryByRole('button', { name: 'Check in now' })).not.toBeInTheDocument();
  });

  it('moves to My leave when applying for leave', async () => {
    const user = userEvent.setup();
    render(<MyHrPanel />);

    await user.click(screen.getByRole('button', { name: 'Apply for leave' }));

    expect(screen.getByRole('tab', { name: 'My leave' })).toHaveAttribute('aria-selected', 'true');
  });
});
