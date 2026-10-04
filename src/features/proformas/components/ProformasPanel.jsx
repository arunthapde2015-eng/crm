import { useCallback, useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { SelectField } from '@/components/SelectField';
import { NAV_IDS } from '@/constants/navigation';
import { formatCurrency } from '@/utils/formatCurrency';
import { toIsoDate } from '@/utils/formatDate';

import { ALL_FILTER_VALUE, PROFORMA_STATUS_LABELS } from '../constants';
import { useProformas } from '../hooks/useProformas';
import {
  createProforma,
  duplicateProforma,
  filterProformas,
  getEmptyFormValues,
  getListSummary,
  toFormValues,
} from '../utils/proformas';
import { ProformaDrawer } from './ProformaDrawer';
import { ProformaForm } from './ProformaForm';
import { ProformasTable } from './ProformasTable';
import styles from './Proformas.module.css';

const STATUS_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All statuses' },
  ...Object.entries(PROFORMA_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

function getFormConfig(editing, today) {
  if (!editing) {
    return {
      title: 'New proforma',
      submitLabel: 'Issue proforma',
      initialValues: getEmptyFormValues(today),
    };
  }
  const nextRevision = editing.revision + 1;
  return {
    title: `Edit ${editing.number}`,
    submitLabel: `Re-issue as rev. ${nextRevision}`,
    initialValues: toFormValues(editing),
    revisionNote: `This proforma has already been issued. Saving re-issues it as rev. ${nextRevision}.`,
  };
}

/**
 * @param {object} props
 * @param {(navId: string) => void} props.onNavigate
 * @param {Date} [props.today] - Reference date for expiry and new documents; injectable for tests.
 */
export function ProformasPanel({ onNavigate, today = new Date() }) {
  const proformaActions = useProformas();
  const { proformas, addProforma, reviseProforma } = proformaActions;
  const [filters, setFilters] = useState({ query: '', status: ALL_FILTER_VALUE });
  // null when closed; { proforma: null } to issue a new one; { proforma } to revise.
  const [openForm, setOpenForm] = useState(null);
  // The proforma shown in the side panel, and whether to print it as soon as it opens.
  const [openDocument, setOpenDocument] = useState(null);

  const todayIsoDate = toIsoDate(today);
  const visibleProformas = filterProformas(proformas, filters, todayIsoDate);
  const summary = getListSummary(visibleProformas);
  const openProforma = proformas.find((proforma) => proforma.id === openDocument?.id);
  const editing = openForm?.proforma ?? null;
  const formConfig = openForm && getFormConfig(editing, today);
  // Stable so the drawer's print-on-open effect isn't cancelled by an unrelated re-render.
  const handlePrinted = useCallback(
    () => setOpenDocument((current) => current && { ...current, shouldPrint: false }),
    [],
  );

  function handleFormSubmit(values) {
    if (editing) reviseProforma(editing.id, values);
    else addProforma(createProforma(values, proformas));
    setOpenForm(null);
  }

  function handleDuplicate(proforma) {
    const copy = duplicateProforma(proforma, proformas, today);
    addProforma(copy);
    setOpenDocument({ id: copy.id, shouldPrint: false });
  }

  return (
    <>
      <PageHeader
        title="Proforma invoices"
        description={`${summary.count} ${summary.count === 1 ? 'document' : 'documents'}, ${formatCurrency(summary.total)} in total.`}
        actions={
          <Button onClick={() => setOpenForm({ proforma: null })} disabled={Boolean(openForm)}>
            New proforma
          </Button>
        }
      />

      <div className={styles.body}>
        {formConfig && (
          <ProformaForm
            key={editing ? `${editing.id}-${editing.revision}` : 'new'}
            {...formConfig}
            onSubmit={handleFormSubmit}
            onCancel={() => setOpenForm(null)}
          />
        )}
        <div className={styles.filters}>
          <label htmlFor="proforma-filter-query" className="visually-hidden">
            Filter proformas
          </label>
          <input
            id="proforma-filter-query"
            type="search"
            className={styles.searchInput}
            placeholder="Filter this list"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
          />
          <SelectField
            id="proforma-filter-status"
            label="Status"
            isLabelHidden
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          />
        </div>
        <ProformasTable
          proformas={visibleProformas}
          todayIsoDate={todayIsoDate}
          onOpen={(proforma) => setOpenDocument({ id: proforma.id, shouldPrint: false })}
          onDownload={(proforma) => setOpenDocument({ id: proforma.id, shouldPrint: true })}
        />
      </div>

      {openProforma && (
        <ProformaDrawer
          proforma={openProforma}
          todayIsoDate={todayIsoDate}
          shouldPrintOnOpen={openDocument.shouldPrint}
          onPrinted={handlePrinted}
          actions={proformaActions}
          onEdit={() => {
            setOpenDocument(null);
            setOpenForm({ proforma: openProforma });
          }}
          onDuplicate={() => handleDuplicate(openProforma)}
          onOpenQuotations={() => onNavigate(NAV_IDS.QUOTATIONS)}
          onClose={() => setOpenDocument(null)}
        />
      )}
    </>
  );
}
