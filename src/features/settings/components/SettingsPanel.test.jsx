import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsPanel } from './SettingsPanel';

describe('SettingsPanel', () => {
  it('opens on the Documents tab with letterhead and bank sections', () => {
    render(<SettingsPanel />);

    expect(screen.getByRole('tab', { name: 'Documents' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('region', { name: 'Letterhead and contact' })).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Bank details printed on proformas and invoices' }),
    ).toBeInTheDocument();
  });

  it('enables saving only after a field changes', async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);

    const saveButton = screen.getByRole('button', { name: 'Save changes' });
    expect(saveButton).toBeDisabled();

    await user.type(screen.getByLabelText('CIN (optional)'), 'U72900MH2020PTC123456');
    expect(screen.getByText('You have unsaved changes.')).toBeInTheDocument();

    await user.click(saveButton);
    expect(screen.getByText('All changes saved.')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it('shows an empty state for tabs without settings yet', async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);

    await user.click(screen.getByRole('tab', { name: 'Numbering' }));

    expect(screen.getByText('Numbering settings are not available yet.')).toBeInTheDocument();
  });
});
