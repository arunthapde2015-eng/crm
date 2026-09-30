import { useState } from 'react';

import { SALESPERSON_NAMES } from '@/constants/team';
import { toIsoDate } from '@/utils/formatDate';

import { LeadRow } from './LeadRow';
import styles from './LeadsTable.module.css';

const COLUMN_COUNT = 11;

/**
 * @param {object} props
 * @param {object[]} props.leads - Leads to show, already filtered.
 * @param {ReturnType<import('../hooks/useLeadSelection').useLeadSelection>} props.selection
 * @param {(leadIds: string[], salespersonId: string | null) => void} props.onAssign
 */
export function LeadsTable({ leads, selection, onAssign }) {
  const [reassigningLeadId, setReassigningLeadId] = useState(null);
  const todayIsoDate = toIsoDate(new Date());

  return (
    <div className={styles.scroller}>
      <table className={styles.table}>
        <caption className="visually-hidden">Leads</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.checkboxCell}>
              <input
                type="checkbox"
                aria-label="Select all shown leads"
                checked={selection.isAllSelected}
                // Indeterminate has no HTML attribute; it can only be set on the DOM node.
                ref={(node) => {
                  if (node) node.indeterminate = selection.isPartlySelected;
                }}
                onChange={selection.toggleAllVisible}
                disabled={leads.length === 0}
              />
            </th>
            <th scope="col">Lead</th>
            <th scope="col">Mobile</th>
            <th scope="col">Source</th>
            <th scope="col">Product</th>
            <th scope="col" className={styles.numeric}>
              Value
            </th>
            <th scope="col">Next follow-up</th>
            <th scope="col">Salesperson</th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 && (
            <tr>
              <td colSpan={COLUMN_COUNT} className={styles.empty}>
                No leads match these filters.
              </td>
            </tr>
          )}
          {leads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              salespersonName={SALESPERSON_NAMES.get(lead.salespersonId)}
              todayIsoDate={todayIsoDate}
              isSelected={selection.isSelected(lead.id)}
              isReassigning={reassigningLeadId === lead.id}
              onToggleSelect={() => selection.toggleLead(lead.id)}
              onReassignStart={() => setReassigningLeadId(lead.id)}
              onReassignEnd={() => setReassigningLeadId(null)}
              onAssign={(salespersonId) => onAssign([lead.id], salespersonId)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
