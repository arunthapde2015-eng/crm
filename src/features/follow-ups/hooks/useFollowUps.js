import { useState } from 'react';

import { INITIAL_FOLLOW_UPS } from '../constants';
import { applyFollowUpLog } from '../utils/followUps';

// In-memory follow-ups until the leads API exists; changes reset on reload.
export function useFollowUps(initialFollowUps = INITIAL_FOLLOW_UPS) {
  const [followUps, setFollowUps] = useState(initialFollowUps);

  function logFollowUp(followUpId, log) {
    setFollowUps((previous) =>
      previous.map((item) => (item.id === followUpId ? applyFollowUpLog(item, log) : item)),
    );
  }

  return { followUps, logFollowUp };
}
