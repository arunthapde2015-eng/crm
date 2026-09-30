import { render, screen, within } from '@testing-library/react';

import { StatGrid } from './StatGrid';

describe('StatGrid', () => {
  it('lists each value with its label inside a named region', () => {
    render(
      <StatGrid
        label="Figures"
        stats={[
          { id: 'a', label: 'Paid days', value: '28' },
          { id: 'b', label: 'Overtime', value: '20h 06m' },
        ]}
      />,
    );

    const items = within(screen.getByRole('region', { name: 'Figures' })).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[1]).toHaveTextContent('20h 06mOvertime');
  });
});
