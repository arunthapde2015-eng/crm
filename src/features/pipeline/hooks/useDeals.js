import { useState } from 'react';

import { INITIAL_DEALS } from '../constants';
import { moveDeal } from '../utils/pipeline';

// In-memory deals until the pipeline API exists; changes reset on reload.
export function useDeals(initialDeals = INITIAL_DEALS) {
  const [deals, setDeals] = useState(initialDeals);

  return {
    deals,
    moveDeal: (dealId, stageId) => setDeals((previous) => moveDeal(previous, dealId, stageId)),
    addDeal: (deal) => setDeals((previous) => [...previous, deal]),
  };
}
