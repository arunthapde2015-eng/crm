import { useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { SelectField } from '@/components/SelectField';
import { formatCurrency } from '@/utils/formatCurrency';
import { toIsoDate } from '@/utils/formatDate';

import { ALL_FILTER_VALUE, QUOTATION_STATUS_LABELS } from '../constants';
import { useQuotations } from '../hooks/useQuotations';
import {
  createQuotation,
  duplicateQuotation,
  filterQuotations,
  getEmptyFormValues,
  getListSummary,
  isRevisionEdit,
  toFormValues,
} from '../utils/quotations';
import { QuotationDrawer } from './QuotationDrawer';
import { QuotationForm } from './QuotationForm';
import { QuotationsTable } from './QuotationsTable';
import styles from './Quotations.module.css';

const STATUS_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All statuses' },
  ...Object.entries(QUOTATION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

function getFormConfig(editing, today) {
  if (!editing) {
    return {
      title: 'New quotation',
      submitLabel: 'Save draft',
      initialValues: getEmptyFormValues(today),
    };
  }
  const nextRevision = editing.revision + 1;
  return {
    title: `Edit ${editing.number}`,
    submitLabel: isRevisionEdit(editing) ? `Save as rev. ${nextRevision}` : 'Save changes',
    initialValues: toFormValues(editing),
    revisionNote: isRevisionEdit(editing)
      ? `This quotation has already been shared. Saving creates rev. ${nextRevision} and returns it to Draft so the new version can be sent.`
      : undefined,
  };
}

/**
 * @param {object} props
 * @param {Date} [props.today] - Reference date for expiry and new documents; injectable for tests.
 */
export function QuotationsPanel({ today = new Date() }) {
  const quotationActions = useQuotations();
  const { quotations, addQuotation, reviseQuotation } = quotationActions;
  const [filters, setFilters] = useState({ query: '', status: ALL_FILTER_VALUE });
  // null when closed; { quotation: null } for a new one; { quotation } to edit.
  const [openForm, setOpenForm] = useState(null);
  const [openQuotationId, setOpenQuotationId] = useState(null);

  const todayIsoDate = toIsoDate(today);
  const visibleQuotations = filterQuotations(quotations, filters, todayIsoDate);
  const summary = getListSummary(visibleQuotations);
  const openQuotation = quotations.find((quotation) => quotation.id === openQuotationId);
  const editing = openForm?.quotation ?? null;
  const formConfig = openForm && getFormConfig(editing, today);

  function handleFormSubmit(values) {
    if (editing) reviseQuotation(editing.id, values);
    else addQuotation(createQuotation(values, quotations));
    setOpenForm(null);
  }

  function handleDuplicate(quotation) {
    const copy = duplicateQuotation(quotation, quotations, today);
    addQuotation(copy);
    setOpenQuotationId(copy.id);
  }

  return (
    <>
      <PageHeader
        title="Quotations"
        description={`${summary.count} ${summary.count === 1 ? 'document' : 'documents'}, ${formatCurrency(summary.total)} in total.`}
        actions={
          <Button onClick={() => setOpenForm({ quotation: null })} disabled={Boolean(openForm)}>
            New quotation
          </Button>
        }
      />

      <div className={styles.body}>
        {formConfig && (
          <QuotationForm
            key={editing ? `${editing.id}-${editing.revision}` : 'new'}
            {...formConfig}
            onSubmit={handleFormSubmit}
            onCancel={() => setOpenForm(null)}
          />
        )}
        <div className={styles.filters}>
          <label htmlFor="quotation-filter-query" className="visually-hidden">
            Filter quotations
          </label>
          <input
            id="quotation-filter-query"
            type="search"
            className={styles.searchInput}
            placeholder="Filter this list"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
          />
          <SelectField
            id="quotation-filter-status"
            label="Status"
            isLabelHidden
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          />
        </div>
        <QuotationsTable
          quotations={visibleQuotations}
          todayIsoDate={todayIsoDate}
          onOpen={(quotation) => setOpenQuotationId(quotation.id)}
          onEdit={(quotation) => setOpenForm({ quotation })}
          onDuplicate={handleDuplicate}
        />
      </div>

      {openQuotation && (
        <QuotationDrawer
          quotation={openQuotation}
          todayIsoDate={todayIsoDate}
          actions={quotationActions}
          onEdit={() => {
            setOpenQuotationId(null);
            setOpenForm({ quotation: openQuotation });
          }}
          onDuplicate={() => handleDuplicate(openQuotation)}
          onClose={() => setOpenQuotationId(null)}
        />
      )}
    </>
  );
}
