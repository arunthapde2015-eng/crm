import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PipelineBoard } from './PipelineBoard';

function getColumn(label) {
  return screen.getByRole('region', { name: label });
}

// Minimal stand-in for the browser's DataTransfer, which jsdom does not provide.
function createDataTransfer() {
  const store = new Map();
  return {
    get types() {
      return [...store.keys()];
    },
    setData: (type, value) => store.set(type, value),
    getData: (type) => store.get(type) ?? '',
  };
}

describe('PipelineBoard', () => {
  it('shows each stage with its deal count and value', () => {
    render(<PipelineBoard />);

    const newColumn = getColumn('New');
    expect(newColumn).toHaveTextContent('3 deals worth, ₹1,41,600');
    expect(within(newColumn).getAllByRole('article')).toHaveLength(3);
    expect(getColumn('Contacted')).toHaveTextContent('2 deals worth, ₹1,05,000');
  });

  it('moves a deal using the stage menu', async () => {
    const user = userEvent.setup();
    render(<PipelineBoard />);

    await user.selectOptions(screen.getByLabelText('Stage for Royal Caterers'), 'Interested');

    expect(
      within(getColumn('Interested')).getByRole('article', { name: 'Royal Caterers' }),
    ).toBeInTheDocument();
    expect(getColumn('New')).toHaveTextContent('2 deals worth, ₹1,29,600');
  });

  it('moves a deal by dragging it onto another column', () => {
    render(<PipelineBoard />);
    const card = screen.getByRole('article', { name: 'Metro Fitness Studio' });
    const wonColumn = getColumn('Won');
    const dataTransfer = createDataTransfer();

    // user-event has no drag-and-drop support, so the native drag events are fired directly.
    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.dragOver(wonColumn, { dataTransfer });
    fireEvent.drop(wonColumn, { dataTransfer });

    expect(
      within(wonColumn).getByRole('article', { name: 'Metro Fitness Studio' }),
    ).toBeInTheDocument();
    expect(within(getColumn('Follow-up')).getByText('No deals')).toBeInTheDocument();
  });

  it('adds a lead to the New column', async () => {
    const user = userEvent.setup();
    render(<PipelineBoard />);

    await user.click(screen.getByRole('button', { name: 'Add lead' }));
    const form = screen.getByRole('form', { name: 'New lead in pipeline' });
    await user.type(within(form).getByLabelText('Lead / organisation name'), 'Acme Traders');
    await user.type(within(form).getByLabelText('Product'), 'Smart POS terminal');
    await user.type(within(form).getByLabelText('Value (₹)'), '30000');
    await user.type(within(form).getByLabelText('Expected close date'), '2026-12-01');
    await user.click(within(form).getByRole('button', { name: 'Add to New' }));

    const newCard = within(getColumn('New')).getByRole('article', { name: 'Acme Traders' });
    expect(newCard).toHaveTextContent('Close 01-12-2026');
    expect(screen.queryByRole('form', { name: 'New lead in pipeline' })).not.toBeInTheDocument();
  });
});
