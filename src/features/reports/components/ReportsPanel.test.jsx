import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReportsPanel } from './ReportsPanel';

const TODAY = new Date(2026, 9, 1);

function getReportTable() {
  return screen.getByRole('table');
}

describe('ReportsPanel', () => {
  it('opens on sales by executive for the last 180 days', () => {
    render(<ReportsPanel today={TODAY} />);

    expect(screen.getByRole('tab', { name: 'Sales by executive' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByLabelText('From')).toHaveValue('2026-04-04');
    expect(screen.getByLabelText('to')).toHaveValue('2026-10-01');

    const rohan = screen.getByRole('rowheader', { name: 'Rohan Kulkarni' }).closest('tr');
    expect(rohan).toHaveTextContent('6₹3,98,750₹4,69,565₹1,29,065');
    expect(screen.getByRole('rowheader', { name: 'Total' }).closest('tr')).toHaveTextContent(
      '8₹4,94,050₹5,81,731₹1,53,441',
    );
  });

  it('switches reports and keeps the date range', async () => {
    const user = userEvent.setup();
    render(<ReportsPanel today={TODAY} />);

    await user.click(screen.getByRole('tab', { name: 'GST summary' }));

    expect(screen.getByRole('heading', { level: 2, name: 'GST summary' })).toBeInTheDocument();
    expect(
      within(getReportTable()).getByRole('columnheader', { name: 'IGST' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('From')).toHaveValue('2026-04-04');
  });

  it('applies a quick range and marks it pressed', async () => {
    const user = userEvent.setup();
    render(<ReportsPanel today={TODAY} />);

    await user.click(screen.getByRole('button', { name: 'This month' }));

    expect(screen.getByRole('button', { name: 'This month' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText('From')).toHaveValue('2026-10-01');
    expect(screen.getByText('Nothing in this period.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy as CSV' })).toBeDisabled();
  });

  it('copies the current report as CSV', async () => {
    const user = userEvent.setup();
    render(<ReportsPanel today={TODAY} />);

    await user.click(screen.getByRole('button', { name: 'Copy as CSV' }));

    expect(await navigator.clipboard.readText()).toBe(
      [
        'Sales executive,Invoices,Taxable,Total,Outstanding',
        'Rohan Kulkarni,6,398750,469565,129065',
        'Sneha Patil,2,95300,112166,24376',
        'Total,8,494050,581731,153441',
      ].join('\r\n'),
    );
    expect(screen.getByRole('status')).toHaveTextContent('Copied 2 rows.');
  });

  it('opens the print dialog', async () => {
    const user = userEvent.setup();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<ReportsPanel today={TODAY} />);

    await user.click(screen.getByRole('button', { name: 'Print / PDF' }));

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('explains an invalid date range instead of showing a table', async () => {
    const user = userEvent.setup();
    render(<ReportsPanel today={TODAY} />);

    const fromInput = screen.getByLabelText('From');
    await user.clear(fromInput);
    await user.type(fromInput, '2026-12-01');

    expect(screen.getByRole('alert')).toHaveTextContent('start date that is on or before');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
