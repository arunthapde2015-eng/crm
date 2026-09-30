import { PIPELINE_STAGE_IDS } from '../constants';

/**
 * One entry per stage, in stage order, with that stage's deals and their total value.
 *
 * @param {object[]} deals
 * @param {{ id: string, label: string }[]} stages
 */
export function groupDealsByStage(deals, stages) {
  return stages.map((stage) => {
    const stageDeals = deals.filter((deal) => deal.stageId === stage.id);
    return {
      ...stage,
      deals: stageDeals,
      totalValue: stageDeals.reduce((total, deal) => total + deal.value, 0),
    };
  });
}

/** Returns deals with one deal moved to another stage; unchanged if already there. */
export function moveDeal(deals, dealId, stageId) {
  return deals.map((deal) =>
    deal.id === dealId && deal.stageId !== stageId ? { ...deal, stageId } : deal,
  );
}

/**
 * Builds a new deal in the first stage from form values.
 *
 * @param {{ name: string, product: string, value: string, salespersonId: string, expectedCloseDate: string }} values
 */
export function createDeal(values) {
  return {
    id: crypto.randomUUID(),
    name: values.name.trim(),
    products: [values.product.trim()].filter(Boolean),
    value: Number(values.value) || 0,
    salespersonId: values.salespersonId || null,
    expectedCloseDate: values.expectedCloseDate,
    stageId: PIPELINE_STAGE_IDS.NEW,
  };
}
