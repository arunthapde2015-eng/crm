import { useState } from 'react';

import { TextField } from '@/components/TextField';

/**
 * From/to date pair for reports. Each field can be cleared and retyped freely; the report only
 * changes once the field holds a full date again.
 *
 * @param {object} props
 * @param {string} props.idPrefix - Keeps field ids unique on the page.
 * @param {{ from: string, to: string }} props.period - Starting dates; this component owns edits.
 * @param {(period: { from: string, to: string }) => void} props.onChange
 */
export function PeriodFields({ idPrefix, period, onChange }) {
  const [draft, setDraft] = useState(period);

  function handleChange(name, value) {
    const nextDraft = { ...draft, [name]: value };
    setDraft(nextDraft);
    if (value !== '') onChange({ ...period, [name]: value });
  }

  return (
    <>
      <TextField
        id={`${idPrefix}-from`}
        label="From"
        type="date"
        value={draft.from}
        max={period.to}
        onChange={(event) => handleChange('from', event.target.value)}
      />
      <TextField
        id={`${idPrefix}-to`}
        label="To"
        type="date"
        value={draft.to}
        min={period.from}
        onChange={(event) => handleChange('to', event.target.value)}
      />
    </>
  );
}
