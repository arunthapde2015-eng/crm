import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Drawer } from './Drawer';

function Harness() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open
      </button>
      {isOpen && (
        <Drawer labelledBy="drawer-title" onClose={() => setIsOpen(false)}>
          <h2 id="drawer-title">Details</h2>
          <button type="button">First</button>
          <button type="button">Last</button>
        </Drawer>
      )}
    </>
  );
}

describe('Drawer', () => {
  it('opens as a named modal dialog and closes on Escape, restoring focus', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog', { name: 'Details' })).toHaveAttribute('aria-modal', 'true');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });

  it('keeps Tab focus inside the panel', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  });
});
