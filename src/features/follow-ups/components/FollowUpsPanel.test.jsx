import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FollowUpsPanel } from './FollowUpsPanel';

const TODAY = new Date(2026, 8, 30);

function getGroup(label) {
  return screen.getByRole('region', { name: new RegExp(`^${label} \\(\\d+\\)$`) });
}

describe('FollowUpsPanel', () => {
  it('summarises and groups follow-ups by due date', () => {
    render(<FollowUpsPanel today={TODAY} />);

    expect(screen.getByText('2 overdue, 2 due today.')).toBeInTheDocument();
    expect(getGroup('Overdue')).toHaveAccessibleName('Overdue (2)');
    expect(
      within(getGroup('Today')).getByRole('rowheader', { name: /^City Care Pharmacy/ }),
    ).toBeInTheDocument();
    expect(within(getGroup('Tomorrow')).getAllByRole('rowheader')).toHaveLength(2);
  });

  it('offers a click-to-call link for the contact', () => {
    render(<FollowUpsPanel today={TODAY} />);

    expect(screen.getByRole('link', { name: 'Call Aditya Naik' })).toHaveAttribute(
      'href',
      'tel:+919823010012',
    );
  });

  it('logs a follow-up and moves it to its new date', async () => {
    const user = userEvent.setup();
    render(<FollowUpsPanel today={TODAY} />);

    await user.click(
      screen.getByRole('button', { name: 'Log follow-up for Metro Fitness Studio' }),
    );
    const form = screen.getByRole('form', { name: 'Log follow-up for Metro Fitness Studio' });
    expect(within(form).getByLabelText('What was discussed')).toHaveFocus();

    await user.type(within(form).getByLabelText('What was discussed'), 'Agreed to a demo');
    await user.selectOptions(within(form).getByLabelText('Type'), 'Meeting');
    await user.click(within(form).getByRole('button', { name: 'Save' }));

    expect(screen.getByText('1 overdue, 2 due today.')).toBeInTheDocument();
    const movedRow = within(getGroup('Tomorrow'))
      .getByRole('rowheader', { name: /^Metro Fitness Studio/ })
      .closest('tr');
    expect(movedRow).toHaveTextContent('Agreed to a demo');
    expect(movedRow).toHaveTextContent('Meeting');
  });

  it('closes the log form on cancel without changes', async () => {
    const user = userEvent.setup();
    render(<FollowUpsPanel today={TODAY} />);

    await user.click(
      screen.getByRole('button', { name: 'Log follow-up for Metro Fitness Studio' }),
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(screen.getByText('2 overdue, 2 due today.')).toBeInTheDocument();
  });
});
