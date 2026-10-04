import { useState } from 'react';

import { DataTable } from '@/components/DataTable';
import { formatMonthKey } from '@/utils/dateRange';
import { formatCurrency } from '@/utils/formatCurrency';

import { getTargetAchievement } from '../utils/metrics';
import { toMonthKey } from '../utils/period';
import { ProgressBar } from './ProgressBar';
import layout from './SalesLayout.module.css';

/**
 * Monthly sales-value targets per salesperson: target → achievement → remaining → %.
 *
 * @param {object} props
 * @param {object} props.data
 * @param {Date} props.today
 * @param {(memberId: string, target: number) => void} props.onSetTarget
 */
export function TargetsTab({ data, today, onSetTarget }) {
  const [monthKey, setMonthKey] = useState(() => toMonthKey(today));
  const rows = getTargetAchievement(data, monthKey);
  const totals = rows.reduce(
    (sum, row) => ({ target: sum.target + row.target, achieved: sum.achieved + row.achieved }),
    { target: 0, achieved: 0 },
  );

  return (
    <div className={layout.stack}>
      <div className={layout.toolbar}>
        <div>
          <label htmlFor="target-month" className={layout.sectionTitle}>
            Month
          </label>{' '}
          <input
            id="target-month"
            type="month"
            className={layout.inlineSelect}
            value={monthKey}
            onChange={(event) => event.target.value && setMonthKey(event.target.value)}
          />
        </div>
        <p className={layout.note}>
          Team: {formatCurrency(totals.achieved)} of {formatCurrency(totals.target)} in{' '}
          {formatMonthKey(monthKey)}. Achievement counts confirmed, processing and completed orders.
        </p>
      </div>
      <DataTable caption={`Targets for ${formatMonthKey(monthKey)}`} tableClassName={layout.table}>
        <thead>
          <tr>
            <th scope="col">Salesperson</th>
            <th scope="col" className={layout.numeric}>
              Monthly target
            </th>
            <th scope="col" className={layout.numeric}>
              Achieved
            </th>
            <th scope="col" className={layout.numeric}>
              Remaining
            </th>
            <th scope="col">Achievement</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <TargetRow key={row.id} row={row} onSave={(target) => onSetTarget(row.id, target)} />
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

function TargetRow({ row, onSave }) {
  const [draft, setDraft] = useState(String(row.target));
  const draftValue = Number(draft);
  const isChanged = draft !== '' && draftValue >= 0 && draftValue !== row.target;
  const inputId = `target-${row.id}`;

  function handleSubmit(event) {
    event.preventDefault();
    if (isChanged) onSave(draftValue);
  }

  return (
    <tr>
      <th scope="row">{row.name}</th>
      <td className={layout.numeric}>
        <form onSubmit={handleSubmit}>
          <label htmlFor={inputId} className="visually-hidden">
            Monthly target for {row.name}
          </label>
          <input
            id={inputId}
            type="number"
            min="0"
            step="1000"
            className={layout.inlineInput}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />{' '}
          <button type="submit" className={layout.textButton} disabled={!isChanged}>
            Save <span className="visually-hidden">target for {row.name}</span>
          </button>
        </form>
      </td>
      <td className={layout.numeric}>{formatCurrency(row.achieved)}</td>
      <td className={layout.numeric}>{formatCurrency(row.remaining)}</td>
      <td>
        <ProgressBar percent={row.percent} label={`${row.name} target achieved`} />
      </td>
    </tr>
  );
}
