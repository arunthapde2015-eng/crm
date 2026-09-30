import { useState } from 'react';

// Local-only until attendance is recorded on the server; resets on reload.
export function useTodayCheckIn() {
  const [checkedInAt, setCheckedInAt] = useState(null);

  function checkIn() {
    setCheckedInAt(new Date());
  }

  return { checkedInAt, checkIn };
}
