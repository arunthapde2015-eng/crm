import { useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { SelectField } from '@/components/SelectField';
import { formatCurrency } from '@/utils/formatCurrency';

import { ALL_FILTER_VALUE, INVOICES, RECEIPT_STATUS_LABELS } from '../constants';
import { useReceipts } from '../hooks/useReceipts';
import {
  createReceipt,
  filterReceipts,
  findInvoice,
  getEmptyFormValues,
  getListSummary,
} from '../utils/receipts';
import { ReceiptDrawer } from './ReceiptDrawer';
import { ReceiptForm } from './ReceiptForm';
import { ReceiptsTable } from './ReceiptsTable';
import styles from './Receipts.module.css';

const STATUS_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All statuses' },
  ...Object.entries(RECEIPT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

function formatSummary({ count, collected }) {
  return `${count} ${count === 1 ? 'receipt' : 'receipts'}, ${formatCurrency(collected)} collected.`;
}

/**
 * Payments received against invoices.
 *
 * @param {object} props
 * @param {Date} [props.today] - Default receipt date; injectable for tests.
 */
export function ReceiptsPanel({ today = new Date() }) {
  const { receipts, addReceipt, voidReceipt } = useReceipts();
  const [filters, setFilters] = useState({ query: '', status: ALL_FILTER_VALUE });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openReceiptId, setOpenReceiptId] = useState(null);

  const visibleReceipts = filterReceipts(receipts, INVOICES, filters);
  const openReceipt = receipts.find((receipt) => receipt.id === openReceiptId);

  function handleSubmit(values) {
    const receipt = createReceipt(values, receipts);
    addReceipt(receipt);
    setIsFormOpen(false);
    // Open the new receipt so it can be printed or shared straight away.
    setOpenReceiptId(receipt.id);
  }

  return (
    <>
      <PageHeader
        title="Receipts"
        description={formatSummary(getListSummary(visibleReceipts))}
        actions={
          <Button onClick={() => setIsFormOpen(true)} disabled={isFormOpen}>
            Record payment
          </Button>
        }
      />

      <div className={styles.body}>
        {isFormOpen && (
          <ReceiptForm
            initialValues={getEmptyFormValues(today)}
            invoices={INVOICES}
            receipts={receipts}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        )}
        <div className={styles.filters}>
          <label htmlFor="receipt-filter-query" className="visually-hidden">
            Filter receipts
          </label>
          <input
            id="receipt-filter-query"
            type="search"
            className={styles.searchInput}
            placeholder="Filter this list"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
          />
          <SelectField
            id="receipt-filter-status"
            label="Status"
            isLabelHidden
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          />
        </div>
        <ReceiptsTable
          receipts={visibleReceipts}
          invoices={INVOICES}
          onOpen={(receipt) => setOpenReceiptId(receipt.id)}
        />
      </div>

      {openReceipt && (
        <ReceiptDrawer
          receipt={openReceipt}
          invoice={findInvoice(INVOICES, openReceipt.invoiceNumber)}
          today={today}
          onVoid={(status, reason, date) => voidReceipt(openReceipt.id, status, reason, date)}
          onClose={() => setOpenReceiptId(null)}
        />
      )}
    </>
  );
}
