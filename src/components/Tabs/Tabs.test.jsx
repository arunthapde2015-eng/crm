import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tabs } from './Tabs';

const TABS = [
  { id: 'one', label: 'One' },
  { id: 'two', label: 'Two' },
  { id: 'three', label: 'Three' },
];

function TabsHarness() {
  const [activeTabId, setActiveTabId] = useState('one');
  return (
    <Tabs
      tabs={TABS}
      activeTabId={activeTabId}
      onTabChange={setActiveTabId}
      label="Sections"
      idPrefix="test"
    >
      Panel {activeTabId}
    </Tabs>
  );
}

describe('Tabs', () => {
  it('shows the panel for the clicked tab', async () => {
    const user = userEvent.setup();
    render(<TabsHarness />);

    await user.click(screen.getByRole('tab', { name: 'Two' }));

    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Two' })).toHaveTextContent('Panel two');
  });

  it('moves selection with arrow keys and wraps around', async () => {
    const user = userEvent.setup();
    render(<TabsHarness />);

    await user.click(screen.getByRole('tab', { name: 'One' }));
    await user.keyboard('{ArrowLeft}');

    expect(screen.getByRole('tab', { name: 'Three' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
  });
});
