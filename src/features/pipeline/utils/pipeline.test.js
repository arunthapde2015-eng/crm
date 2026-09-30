import { INITIAL_DEALS, PIPELINE_STAGE_IDS, PIPELINE_STAGES } from '../constants';
import { createDeal, groupDealsByStage, moveDeal } from './pipeline';

describe('groupDealsByStage', () => {
  it('keeps stage order and totals each stage', () => {
    const columns = groupDealsByStage(INITIAL_DEALS, PIPELINE_STAGES);
    const [newColumn, contactedColumn] = columns;

    expect(columns.map((column) => column.id)).toEqual(PIPELINE_STAGES.map((stage) => stage.id));
    expect(newColumn).toMatchObject({ label: 'New', totalValue: 141600 });
    expect(newColumn.deals).toHaveLength(3);
    expect(contactedColumn).toMatchObject({ label: 'Contacted', totalValue: 105000 });
  });

  it('includes empty stages with a zero total', () => {
    const [firstColumn] = groupDealsByStage([], PIPELINE_STAGES);

    expect(firstColumn).toMatchObject({ deals: [], totalValue: 0 });
  });
});

describe('moveDeal', () => {
  it('changes only the moved deal', () => {
    const moved = moveDeal(INITIAL_DEALS, 'deal-1', PIPELINE_STAGE_IDS.WON);

    expect(moved.find((deal) => deal.id === 'deal-1').stageId).toBe(PIPELINE_STAGE_IDS.WON);
    expect(moved.filter((deal, index) => deal !== INITIAL_DEALS[index])).toHaveLength(1);
  });

  it('keeps the same objects when the stage does not change', () => {
    const moved = moveDeal(INITIAL_DEALS, 'deal-1', PIPELINE_STAGE_IDS.NEW);

    expect(moved).toEqual(INITIAL_DEALS);
    expect(moved[0]).toBe(INITIAL_DEALS[0]);
  });
});

describe('createDeal', () => {
  it('starts in New and cleans up the form values', () => {
    const deal = createDeal({
      name: '  Acme Traders ',
      product: ' POS ',
      value: '25000',
      salespersonId: '',
      expectedCloseDate: '2026-12-01',
    });

    expect(deal).toMatchObject({
      name: 'Acme Traders',
      products: ['POS'],
      value: 25000,
      salespersonId: null,
      stageId: PIPELINE_STAGE_IDS.NEW,
    });
  });
});
