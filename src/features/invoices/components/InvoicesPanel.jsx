import { useCallback, useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { SelectField } from '@/components/SelectField';
import { formatCurrency } from '@/utils/formatCurrency';
import { toIsoDate } from '@/utils/formatDate';

import {
  ALL_FILTER_VALUE,
  INVOICE_STATUS_LABELS,
  KIND_FILTER_LABELS,
  KIND_FILTERS,
} from '../constants';
import { useInvoices } from '../hooks/useInvoices';
import {
  createInvoice,
  duplicateInvoice,
  filterInvoices,
  getEmptyFormValues,
  getListSummary,
  toFormValues,
} from '../utils/invoices';
import { InvoiceDrawer } from './InvoiceDrawer';
import { InvoiceForm } from './InvoiceForm';
import { InvoicesTable } from './InvoicesTable';
import styles from './Invoices.module.css';

const STATUS_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All statuses' },
  ...Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];
const KIND_OPTIONS = Object.entries(KIND_FILTER_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function formatSummary({ count, billed, outstanding }) {
  const noun = count === 1 ? 'invoice' : 'invoices';
  return `${count} ${noun}, ${formatCurrency(billed)} billed, ${formatCurrency(outstanding)} outstanding.`;
}

/**
 * @param {object} props
 * @param {Date} [props.today] - Reference date for overdue and new documents; injectable for tests.
 */
export function InvoicesPanel({ today = new Date() }) {
  const invoiceActions = useInvoices();
  const { invoices, addInvoice, updateDraft } = invoiceActions;
  const [filters, setFilters] = useState({
    query: '',
    status: ALL_FILTER_VALUE,
    kind: KIND_FILTERS.ALL,
  });
  // null when closed; { invoice: null } for a new one; { invoice } to edit a draft.
  const [openForm, setOpenForm] = useState(null);
  // The invoice shown in the side panel, and whether to print it as soon as it opens.
  const [openDocument, setOpenDocument] = useState(null);

  const todayIsoDate = toIsoDate(today);
  const visibleInvoices = filterInvoices(invoices, filters, todayIsoDate);
  const openInvoice = invoices.find((invoice) => invoice.id === openDocument?.id);
  const editing = openForm?.invoice ?? null;
  // Stable so the drawer's print-on-open effect isn't cancelled by an unrelated re-render.
  const handlePrinted = useCallback(
    () => setOpenDocument((current) => current && { ...current, shouldPrint: false }),
    [],
  );

  function setFilter(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function handleFormSubmit(values, shouldIssue) {
    if (editing) {
      updateDraft(editing.id, values);
      if (shouldIssue) invoiceActions.issue(editing.id);
    } else {
      addInvoice(createInvoice(values, invoices, shouldIssue));
    }
    setOpenForm(null);
  }

  function handleDuplicate(invoice) {
    const copy = duplicateInvoice(invoice, invoices, today);
    addInvoice(copy);
    setOpenDocument({ id: copy.id, shouldPrint: false });
  }

  return (
    <>
      <PageHeader
        title="Sales invoices"
        description={formatSummary(getListSummary(visibleInvoices))}
        actions={
          <Button onClick={() => setOpenForm({ invoice: null })} disabled={Boolean(openForm)}>
            New invoice
          </Button>
        }
      />

      <div className={styles.body}>
        {openForm && (
          <InvoiceForm
            key={editing?.id ?? 'new'}
            title={editing ? `Edit draft ${editing.number}` : 'New invoice'}
            initialValues={editing ? toFormValues(editing) : getEmptyFormValues(today)}
            onSubmit={handleFormSubmit}
            onCancel={() => setOpenForm(null)}
          />
        )}
        <div className={styles.filters}>
          <label htmlFor="invoice-filter-query" className="visually-hidden">
            Filter invoices
          </label>
          <input
            id="invoice-filter-query"
            type="search"
            className={styles.searchInput}
            placeholder="Filter this list"
            value={filters.query}
            onChange={(event) => setFilter('query', event.target.value)}
          />
          <SelectField
            id="invoice-filter-status"
            label="Status"
            isLabelHidden
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(event) => setFilter('status', event.target.value)}
          />
          <SelectField
            id="invoice-filter-kind"
            label="Invoice type"
            isLabelHidden
            options={KIND_OPTIONS}
            value={filters.kind}
            onChange={(event) => setFilter('kind', event.target.value)}
          />
        </div>
        <InvoicesTable
          invoices={visibleInvoices}
          todayIsoDate={todayIsoDate}
          onOpen={(invoice) => setOpenDocument({ id: invoice.id, shouldPrint: false })}
          onDownload={(invoice) => setOpenDocument({ id: invoice.id, shouldPrint: true })}
        />
      </div>

      {openInvoice && (
        <InvoiceDrawer
          invoice={openInvoice}
          allInvoices={invoices}
          today={today}
          shouldPrintOnOpen={openDocument.shouldPrint}
          onPrinted={handlePrinted}
          actions={invoiceActions}
          onEdit={() => {
            setOpenDocument(null);
            setOpenForm({ invoice: openInvoice });
          }}
          onDuplicate={() => handleDuplicate(openInvoice)}
          onClose={() => setOpenDocument(null)}
        />
      )}
    </>
  );
}
