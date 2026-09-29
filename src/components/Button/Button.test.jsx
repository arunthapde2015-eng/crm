import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './Button';

describe('Button', () => {
  it('renders its label and calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Save</Button>);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Save
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
