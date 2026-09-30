import { useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { SALESPERSONS } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';

import { DEFAULT_LEAD_FILTERS } from '../constants';
import { useLeads } from '../hooks/useLeads';
import { useLeadSelection } from '../hooks/useLeadSelection';
import { createLead } from '../utils/leadChanges';
import {
  filterLeads,
  getPipelineValue,
  getTeamWorkload,
  getUnassignedLeads,
} from '../utils/leadQueries';
import { AddLeadForm } from './AddLeadForm';
import { BulkAssignBar } from './BulkAssignBar';
import { LeadFilters } from './LeadFilters';
import { LeadsTable } from './LeadsTable';
import styles from './LeadsPanel.module.css';

export function LeadsPanel() {
  const { leads, addLead, assignLeads, assignAllUnassigned } = useLeads();
  const [filters, setFilters] = useState(DEFAULT_LEAD_FILTERS);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const visibleLeads = filterLeads(leads, filters);
  const selection = useLeadSelection(visibleLeads.map((lead) => lead.id));
  const unassignedCount = getUnassignedLeads(leads).length;
  const workloadSummary = getTeamWorkload(leads, SALESPERSONS)
    .map((member) => `${member.name.split(' ')[0]} ${member.openLeadCount}`)
    .join(', ');
  const selectedCount = selection.selectedVisibleIds.length;

  function handleFilterChange(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function handleAddLead(values) {
    addLead(createLead(values, leads));
    setIsAddFormOpen(false);
  }

  function handleBulkAssign(salespersonId) {
    assignLeads(selection.selectedVisibleIds, salespersonId);
    selection.clearSelection();
  }

  const description = (
    <>
      {visibleLeads.length} of {leads.length} leads. Pipeline value{' '}
      {formatCurrency(getPipelineValue(visibleLeads))}.
      {unassignedCount > 0 && (
        <strong className={styles.unassigned}> {unassignedCount} unassigned.</strong>
      )}
    </>
  );

  return (
    <>
      <PageHeader
        title="Leads"
        description={description}
        actions={
          <>
            {unassignedCount > 0 && (
              <Button variant="secondary" onClick={assignAllUnassigned}>
                Assign {unassignedCount} unassigned
              </Button>
            )}
            <Button onClick={() => setIsAddFormOpen(true)} disabled={isAddFormOpen}>
              Add lead
            </Button>
          </>
        }
      />

      <div className={styles.body}>
        {isAddFormOpen && (
          <AddLeadForm onSubmit={handleAddLead} onCancel={() => setIsAddFormOpen(false)} />
        )}
        <LeadFilters filters={filters} onFilterChange={handleFilterChange} />
        <p className={styles.workload}>Team workload (open leads): {workloadSummary}</p>
        {selectedCount > 0 && (
          <BulkAssignBar
            selectedCount={selectedCount}
            onAssign={handleBulkAssign}
            onClear={selection.clearSelection}
          />
        )}
        <LeadsTable leads={visibleLeads} selection={selection} onAssign={assignLeads} />
      </div>
    </>
  );
}
